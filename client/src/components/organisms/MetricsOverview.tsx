import { MetricCard } from "@/components/atoms/MetricCard";
import { SystemMetric } from "@/types";
import { Cpu, HardDrive, Layout, Activity, Zap } from "lucide-react";

interface MetricsOverviewProps {
  latest: SystemMetric | null;
}

export const MetricsOverview = ({ latest }: MetricsOverviewProps) => {
  if (!latest) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* CPU & RAM */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <MetricCard
          title="Utilisation CPU"
          value={latest.cpu_usage}
          unit="%"
          icon={<Cpu className="h-4 w-4" />}
          description={`${latest.cpu_temp}°C`}
          color="blue"
        />
        <MetricCard
          title="Utilisation RAM"
          value={latest.ram_usage_percent.toFixed(1)}
          unit="%"
          icon={<Activity className="h-4 w-4" />}
          description={`${(latest.ram_usage_mb / 1024).toFixed(1)} / ${(latest.ram_total_mb / 1024).toFixed(1)} Go`}
          color="red"
        />
      </div>

      {/* Disques SSD */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <MetricCard
          title="SSD NVMe"
          value={((latest.disk_usage_gb / latest.disk_total_gb) * 100).toFixed(1)}
          unit="%"
          icon={<HardDrive className="h-4 w-4" />}
          description={`${latest.disk_usage_gb} / ${latest.disk_total_gb} Go`}
          color="orange"
        />
        <MetricCard
          title="SSD SATA"
          value={((latest.disk_sata_usage_gb / latest.disk_sata_total_gb) * 100).toFixed(1)}
          unit="%"
          icon={<HardDrive className="h-4 w-4" />}
          description={`${latest.disk_sata_usage_gb} / ${latest.disk_sata_total_gb} Go`}
          color="orange"
        />
      </div>

      {/* Puissance & Uptime */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <MetricCard
          title="Puissance"
          value={(latest.power_usage_w || 0).toFixed(1)}
          unit=" W"
          icon={<Zap className="h-4 w-4" />}
          description="Consommation est."
          color="yellow"
        />
        <MetricCard
          title="Temps d'activité"
          value={latest.uptime.split(',')[0]}
          icon={<Layout className="h-4 w-4" />}
          description={latest.uptime}
          color="indigo"
        />
      </div>
    </div>
  );
};
