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
          color="#ef4444"
          unit="°C"
        />
        <MetricChart
          title="Utilisation CPU"
          data={reversedHistory}
          dataKey="cpu_usage"
          color="#3b82f6"
          unit="%"
        />
      </div>

      {/* RAM & Réseau */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <MetricChart
          title="Utilisation RAM"
          data={reversedHistory}
          dataKey="ram_usage_percent"
          color="#10b981"
          unit="%"
        />
        <MetricChart
          title="Usage Réseau (Entrant)"
          data={reversedHistory}
          dataKey="net_rx_mb"
          color="#f59e0b"
          unit=" Mo/s"
        />
      </div>

      {/* Énergie & Coût */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <MetricChart
          title="Consommation Électrique"
          data={reversedHistory}
          dataKey="power_usage_w"
          color="#a78bfa"
          unit=" W"
        />
        <MetricChart
          title="Coût Électrique Estimé"
          data={reversedHistory}
          dataKey="estimated_cost_monthly"
          color="#22c55e"
          unit=" €/mois"
        />
      </div>
    </div>
  );
};
