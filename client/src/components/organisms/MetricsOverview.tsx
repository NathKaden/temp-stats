import { MetricCard } from "@/components/atoms/MetricCard";
import { SystemMetric } from "@/types";
import { Cpu, HardDrive, Layout, Activity } from "lucide-react";

interface MetricsOverviewProps {
  latest: SystemMetric | null;
}

export const MetricsOverview = ({ latest }: MetricsOverviewProps) => {
  if (!latest) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="CPU Usage"
        value={latest.cpu_usage}
        unit="%"
        icon={<Cpu className="h-4 w-4" />}
        description={`${latest.cpu_temp}°C`}
      />
      <MetricCard
        title="RAM Usage"
        value={latest.ram_usage_percent.toFixed(1)}
        unit="%"
        icon={<Activity className="h-4 w-4" />}
        description={`${(latest.ram_usage_mb / 1024).toFixed(1)} / ${(latest.ram_total_mb / 1024).toFixed(1)} Go`}
      />
      <MetricCard
        title="Disk Usage"
        value={((latest.disk_usage_gb / latest.disk_total_gb) * 100).toFixed(1)}
        unit="%"
        icon={<HardDrive className="h-4 w-4" />}
        description={`${latest.disk_usage_gb} / ${latest.disk_total_gb} GB`}
      />
      <MetricCard
        title="Uptime"
        value={latest.uptime.split(',')[0]}
        icon={<Layout className="h-4 w-4" />}
        description={latest.uptime}
      />
    </div>
  );
};
