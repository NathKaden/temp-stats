import { MetricChart } from "@/components/molecules/MetricChart";
import { SystemMetric } from "@/types";

interface HistorySectionProps {
  history: SystemMetric[];
}

export const HistorySection = ({ history }: HistorySectionProps) => {
  const reversedHistory = [...history].reverse();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <MetricChart
        title="CPU Temperature"
        data={reversedHistory}
        dataKey="cpu_temp"
        color="#ef4444"
        unit="°C"
      />
      <MetricChart
        title="CPU Usage"
        data={reversedHistory}
        dataKey="cpu_usage"
        color="#3b82f6"
        unit="%"
      />
      <MetricChart
        title="RAM Usage"
        data={reversedHistory}
        dataKey="ram_usage_percent"
        color="#10b981"
        unit="%"
      />
      <MetricChart
        title="Network Usage (RX)"
        data={reversedHistory}
        dataKey="net_rx_mb"
        color="#f59e0b"
        unit=" MB/s"
      />
      <MetricChart
        title="Power Consumption"
        data={reversedHistory}
        dataKey="power_usage_w"
        color="#a78bfa"
        unit=" W"
      />
    </div>
  );
};
