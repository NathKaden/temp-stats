import { MetricCard } from "@/components/atoms/MetricCard";
import { SystemMetric } from "@/types";
import { Cpu, HardDrive, Layout, Activity, Zap } from "lucide-react";

interface MetricsOverviewProps {
  latest: SystemMetric | null;
}

export const MetricsOverview = ({ latest }: MetricsOverviewProps) => {
  if (!latest) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
        description={`${(latest.ram_usage_mb / 1024).toFixed(1)} / ${(latest.ram_total_mb / 1024).toFixed(1)} GB`}
      />
      <MetricCard
        title="Disk Usage"
        value={((latest.disk_usage_gb / latest.disk_total_gb) * 100).toFixed(1)}
        unit="%"
        icon={<HardDrive className="h-4 w-4" />}
        description={`${latest.disk_usage_gb} / ${latest.disk_total_gb} GB`}
      />
      <MetricCard
        title="Power"
        value={(latest.power_usage_w || 0).toFixed(1)}
        unit=" W"
        icon={<Zap className="h-4 w-4" />}
        description="Est. consumption"
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
