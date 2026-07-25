import { useState, useEffect } from "react";
import { MetricChart } from "@/components/molecules/MetricChart";
import { SystemMetric } from "@/types";

interface HistorySectionProps {
  history: SystemMetric[];
  timeRange: "24h" | "7d" | "30d" | "all";
}

export const HistorySection = ({ history, timeRange }: HistorySectionProps) => {
  const [zoomDomain, setZoomDomain] = useState<{ left: string; right: string } | null>(null);

  const reversedHistory = [...history].reverse();

  // Reset zoom when timeRange changes from parent toolbar
  useEffect(() => {
    setZoomDomain(null);
  }, [timeRange]);

  const handleZoom = (left: string | null, right: string | null) => {
    if (left === null || right === null) {
      setZoomDomain(null);
    } else {
      setZoomDomain({ left, right });
    }
  };

  // Filter data points based on selected timeRange
  const filterData = (data: typeof reversedHistory) => {
    if (timeRange === "all") return data;
    const limitDate = new Date();
    if (timeRange === "24h") {
      limitDate.setHours(limitDate.getHours() - 24);
    } else if (timeRange === "7d") {
      limitDate.setDate(limitDate.getDate() - 7);
    } else if (timeRange === "30d") {
      limitDate.setDate(limitDate.getDate() - 30);
    }
    return data.filter(item => new Date(item.timestamp) >= limitDate);
  };

  const filteredHistory = filterData(reversedHistory);

  // Compute cumulative cost over the entire base timeframe first
  let cumulativeCost = 0.0;
  const historyWithCumulative = filteredHistory.map((item, idx) => {
    let intervalHours = 1.0;
    if (idx > 0) {
      const prevTime = new Date(filteredHistory[idx - 1].timestamp).getTime();
      const currTime = new Date(item.timestamp).getTime();
      const diffMs = currTime - prevTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      intervalHours = diffHours > 4.0 ? 1.0 : diffHours;
    }
    const power = item.power_usage_w || 0.0;
    const kwh = (power * intervalHours) / 1000.0;
    const cost = kwh * 0.18; // 0.18 € per kWh
    cumulativeCost += cost;

    return {
      ...item,
      cumulative_cost_eur: parseFloat(cumulativeCost.toFixed(3))
    };
  });

  // Apply zoom filtering based on timestamp boundaries
  const zoomedHistory = zoomDomain
    ? historyWithCumulative.filter(item => {
        const itemTime = item.timestamp;
        const minTime = zoomDomain.left < zoomDomain.right ? zoomDomain.left : zoomDomain.right;
        const maxTime = zoomDomain.left < zoomDomain.right ? zoomDomain.right : zoomDomain.left;
        return itemTime >= minTime && itemTime <= maxTime;
      })
    : historyWithCumulative;

  return (
    <div className="flex flex-col gap-16">
      {/* Zoom Helper Label */}
      {zoomDomain && (
        <div className="flex justify-end -mb-12">
          <span className="text-[10px] text-muted-foreground/60 mr-1 animate-pulse">
            Double-cliquez sur un graphique pour zoomer arrière
          </span>
        </div>
      )}

      {/* Section Utilisation */}
      <div className="flex flex-col gap-4 pt-10">
        <h2 className="font-poppins text-2xl font-bold tracking-wide text-zinc-400 ml-1">Utilisation</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <MetricChart
            title="Température CPU"
            data={zoomedHistory}
            dataKey="cpu_temp"
            color="#3b82f6"
            unit="°C"
            onZoom={handleZoom}
          />
          <MetricChart
            title="Utilisation CPU"
            data={zoomedHistory}
            dataKey="cpu_usage"
            color="#60a5fa"
            unit="%"
            onZoom={handleZoom}
          />
          <MetricChart
            title="Utilisation RAM"
            data={zoomedHistory}
            dataKey="ram_usage_percent"
            color="#ff2c4c"
            unit="%"
            onZoom={handleZoom}
          />
        </div>
      </div>

      {/* Section Activité */}
      <div className="flex flex-col gap-4">
        <h2 className="font-poppins text-2xl font-bold tracking-wide text-zinc-400 ml-1">Activité</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <MetricChart
            title="Usage Réseau (Entrant)"
            data={zoomedHistory}
            dataKey="net_rx_mb"
            color="#8b5cf6"
            unit=" Mo/s"
            onZoom={handleZoom}
          />
          <MetricChart
            title="Usage Réseau (Sortant)"
            data={zoomedHistory}
            dataKey="net_tx_mb"
            color="#6366f1"
            unit=" Mo/s"
            onZoom={handleZoom}
          />
          <MetricChart
            title="Consommation Électrique"
            data={zoomedHistory}
            dataKey="power_usage_w"
            color="#eab308"
            unit=" W"
            onZoom={handleZoom}
          />
          <MetricChart
            title="Coût Électrique Cumulé (depuis le 10/07)"
            data={zoomedHistory}
            dataKey="cumulative_cost_eur"
            color="#10b981"
            unit=" €"
            onZoom={handleZoom}
          />
        </div>
      </div>
    </div>
  );
};
