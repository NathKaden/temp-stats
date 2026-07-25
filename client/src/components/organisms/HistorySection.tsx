import { useState, useEffect } from "react";
import { MetricChart } from "@/components/molecules/MetricChart";
import { SystemMetric } from "@/types";

interface HistorySectionProps {
  history: SystemMetric[];
  timeRange: "24h" | "7d" | "30d" | "all";
}

export const HistorySection = ({ history, timeRange }: HistorySectionProps) => {
  const [zoomDomain, setZoomDomain] = useState<{ left: string; right: string } | null>(null);
  const [chartMode, setChartMode] = useState<"zoom" | "pan">("zoom");

  const reversedHistory = [...history].reverse();

  // Reset zoom when timeRange changes from parent toolbar
  useEffect(() => {
    setZoomDomain(null);
    setChartMode("zoom");
  }, [timeRange]);

  const handleZoom = (left: string | null, right: string | null) => {
    if (left === null || right === null) {
      setZoomDomain(null);
    } else {
      setZoomDomain({ left, right });
    }
  };

  const handlePan = (shiftAmount: number) => {
    if (!zoomDomain) return;

    const idx1 = historyWithCumulative.findIndex(item => item.timestamp === zoomDomain.left);
    const idx2 = historyWithCumulative.findIndex(item => item.timestamp === zoomDomain.right);
    if (idx1 === -1 || idx2 === -1) return;

    const minIdx = Math.min(idx1, idx2);
    const maxIdx = Math.max(idx1, idx2);
    const windowSize = maxIdx - minIdx;

    let newMinIdx = minIdx + shiftAmount;
    let newMaxIdx = maxIdx + shiftAmount;

    if (newMinIdx < 0) {
      newMinIdx = 0;
      newMaxIdx = Math.min(historyWithCumulative.length - 1, windowSize);
    } else if (newMaxIdx >= historyWithCumulative.length) {
      newMaxIdx = historyWithCumulative.length - 1;
      newMinIdx = Math.max(0, newMaxIdx - windowSize);
    }

    setZoomDomain({
      left: historyWithCumulative[newMinIdx].timestamp,
      right: historyWithCumulative[newMaxIdx].timestamp
    });
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

  // Helper to calculate pan step
  const getPanStep = () => {
    if (!zoomDomain) return 1;
    const idx1 = historyWithCumulative.findIndex(item => item.timestamp === zoomDomain.left);
    const idx2 = historyWithCumulative.findIndex(item => item.timestamp === zoomDomain.right);
    if (idx1 === -1 || idx2 === -1) return 1;
    const minIdx = Math.min(idx1, idx2);
    const maxIdx = Math.max(idx1, idx2);
    return Math.max(1, Math.round((maxIdx - minIdx) * 0.25));
  };

  const panStep = getPanStep();

  return (
    <div className="flex flex-col gap-16">
      {/* Zoom Helper & Mode Toggle Panel */}
      {zoomDomain && (
        <div className="flex justify-between items-center -mb-12 flex-wrap gap-4 w-full">
          <div className="flex items-center gap-3.5 flex-wrap">
            <span className="text-[10px] text-muted-foreground/60 mr-1 animate-pulse">
              Double-cliquez sur un graphique pour zoomer arrière
            </span>
            <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-white/5 backdrop-blur-md">
              <button
                onClick={() => handlePan(-panStep)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-white/10 text-violet-300 border-0 cursor-pointer flex items-center justify-center transition-all"
                title="Reculer dans le temps (plus ancien)"
              >
                ◀
              </button>
              <span className="px-2 text-[10px] font-semibold text-muted-foreground/70 self-center select-none">
                Déplacer
              </span>
              <button
                onClick={() => handlePan(panStep)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg hover:bg-white/10 text-violet-300 border-0 cursor-pointer flex items-center justify-center transition-all"
                title="Avancer dans le temps (plus récent)"
              >
                ▶
              </button>
            </div>
          </div>
          <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-white/5 backdrop-blur-md">
            <button
              onClick={() => setChartMode("zoom")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-0 flex items-center gap-1.5 ${
                chartMode === "zoom"
                  ? "bg-white/10 text-violet-300 shadow-sm"
                  : "text-muted-foreground/70 hover:text-foreground bg-transparent"
              }`}
            >
              <span>🔍</span> Zoom
            </button>
            <button
              onClick={() => setChartMode("pan")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer border-0 flex items-center gap-1.5 ${
                chartMode === "pan"
                  ? "bg-white/10 text-violet-300 shadow-sm"
                  : "text-muted-foreground/70 hover:text-foreground bg-transparent"
              }`}
            >
              <span>✋</span> Glisser
            </button>
          </div>
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
            onPan={handlePan}
            chartMode={chartMode}
          />
          <MetricChart
            title="Utilisation CPU"
            data={zoomedHistory}
            dataKey="cpu_usage"
            color="#60a5fa"
            unit="%"
            onZoom={handleZoom}
            onPan={handlePan}
            chartMode={chartMode}
          />
          <MetricChart
            title="Utilisation RAM"
            data={zoomedHistory}
            dataKey="ram_usage_percent"
            color="#ff2c4c"
            unit="%"
            onZoom={handleZoom}
            onPan={handlePan}
            chartMode={chartMode}
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
            onPan={handlePan}
            chartMode={chartMode}
          />
          <MetricChart
            title="Usage Réseau (Sortant)"
            data={zoomedHistory}
            dataKey="net_tx_mb"
            color="#6366f1"
            unit=" Mo/s"
            onZoom={handleZoom}
            onPan={handlePan}
            chartMode={chartMode}
          />
          <MetricChart
            title="Consommation Électrique"
            data={zoomedHistory}
            dataKey="power_usage_w"
            color="#eab308"
            unit=" W"
            onZoom={handleZoom}
            onPan={handlePan}
            chartMode={chartMode}
          />
          <MetricChart
            title="Coût Électrique Cumulé (depuis le 10/07)"
            data={zoomedHistory}
            dataKey="cumulative_cost_eur"
            color="#10b981"
            unit=" €"
            onZoom={handleZoom}
            onPan={handlePan}
            chartMode={chartMode}
          />
        </div>
      </div>
    </div>
  );
};
