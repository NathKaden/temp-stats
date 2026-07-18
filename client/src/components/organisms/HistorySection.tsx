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
    <div className="flex flex-col gap-6">
      {/* Statistiques CPU */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
      </div>

      {/* RAM & Réseau */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <MetricChart
          title="Utilisation RAM"
          data={reversedHistory}
          dataKey="ram_usage_percent"
          color="#ff2c4c"
          unit="%"
        />
        <MetricChart
          title="Usage Réseau (Entrant)"
          data={reversedHistory}
          dataKey="net_rx_mb"
          color="#8b5cf6"
          unit=" Mo/s"
        />
      </div>

      {/* Énergie & Coût */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
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
  );
};
