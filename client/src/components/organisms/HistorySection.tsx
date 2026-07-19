import { MetricChart } from "@/components/molecules/MetricChart";
import { SystemMetric } from "@/types";

interface HistorySectionProps {
  history: SystemMetric[];
}

export const HistorySection = ({ history }: HistorySectionProps) => {
  const reversedHistory = [...history].reverse();

  let cumulativeCost = 0.0;
  const historyWithCumulative = reversedHistory.map((item, idx) => {
    let intervalHours = 1.0;
    if (idx > 0) {
      const prevTime = new Date(reversedHistory[idx - 1].timestamp).getTime();
      const currTime = new Date(item.timestamp).getTime();
      const diffMs = currTime - prevTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      // Cap at 4 hours to handle offline gaps safely
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

  return (
    <div className="flex flex-col gap-8">
      {/* Section Utilisation */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-wider text-muted-foreground/50 ml-1">Utilisation</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <MetricChart
            title="Température CPU"
            data={historyWithCumulative}
            dataKey="cpu_temp"
            color="#3b82f6"
            unit="°C"
          />
          <MetricChart
            title="Utilisation CPU"
            data={historyWithCumulative}
            dataKey="cpu_usage"
            color="#60a5fa"
            unit="%"
          />
          <MetricChart
            title="Utilisation RAM"
            data={historyWithCumulative}
            dataKey="ram_usage_percent"
            color="#ff2c4c"
            unit="%"
          />
        </div>
      </div>

      {/* Section Activité */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-wider text-muted-foreground/50 ml-1">Activité</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <MetricChart
            title="Usage Réseau (Entrant)"
            data={historyWithCumulative}
            dataKey="net_rx_mb"
            color="#8b5cf6"
            unit=" Mo/s"
          />
          <MetricChart
            title="Usage Réseau (Sortant)"
            data={historyWithCumulative}
            dataKey="net_tx_mb"
            color="#6366f1"
            unit=" Mo/s"
          />
          <MetricChart
            title="Consommation Électrique"
            data={historyWithCumulative}
            dataKey="power_usage_w"
            color="#eab308"
            unit=" W"
          />
          <MetricChart
            title="Coût Électrique Cumulé (depuis le 10/07)"
            data={historyWithCumulative}
            dataKey="cumulative_cost_eur"
            color="#10b981"
            unit=" €"
          />
        </div>
      </div>
    </div>
  );
};
