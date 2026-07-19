import { MetricChart } from "@/components/molecules/MetricChart";
import { SystemMetric } from "@/types";

interface HistorySectionProps {
  history: SystemMetric[];
}

export const HistorySection = ({ history }: HistorySectionProps) => {
  const reversedHistory = [...history].reverse().map(item => ({
    ...item,
    estimated_cost_monthly: parseFloat(((item.power_usage_w || 0) * 0.18).toFixed(2))
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Section Utilisation */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-wider text-muted-foreground/50 ml-1">Utilisation</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <MetricChart
            title="Température CPU"
            data={reversedHistory}
            dataKey="cpu_temp"
            color="#3b82f6"
            unit="°C"
          />
          <MetricChart
            title="Utilisation CPU"
            data={reversedHistory}
            dataKey="cpu_usage"
            color="#60a5fa"
            unit="%"
          />
          <MetricChart
            title="Utilisation RAM"
            data={reversedHistory}
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
            data={reversedHistory}
            dataKey="net_rx_mb"
            color="#8b5cf6"
            unit=" Mo/s"
          />
          <MetricChart
            title="Usage Réseau (Sortant)"
            data={reversedHistory}
            dataKey="net_tx_mb"
            color="#6366f1"
            unit=" Mo/s"
          />
          <MetricChart
            title="Consommation Électrique"
            data={reversedHistory}
            dataKey="power_usage_w"
            color="#eab308"
            unit=" W"
          />
          <MetricChart
            title="Coût Électrique Estimé"
            data={reversedHistory}
            dataKey="estimated_cost_monthly"
            color="#10b981"
            unit=" €/mois"
          />
        </div>
      </div>
    </div>
  );
};
