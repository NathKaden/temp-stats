import { MetricCard } from "@/components/atoms/MetricCard";
import { SystemMetric } from "@/types";
import { Cpu, HardDrive, Layout, Activity, Zap } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface MetricsOverviewProps {
  latest: SystemMetric | null;
}

export const MetricsOverview = ({ latest }: MetricsOverviewProps) => {
  if (!latest) return null;

  // Calculate used, total and free space for NVMe SSD
  const nvmeUsed = latest.disk_usage_gb || 0.0;
  const nvmeTotal = latest.disk_total_gb || 1.0;
  const nvmeFree = Math.max(0, parseFloat((nvmeTotal - nvmeUsed).toFixed(1)));
  const nvmePercent = ((nvmeUsed / nvmeTotal) * 100).toFixed(1);

  // Parse the services breakdown JSON
  let servicesData: { name: string; value: number; color: string }[] = [];
  try {
    if (latest.disk_services_json) {
      const parsed = JSON.parse(latest.disk_services_json);
      servicesData = [
        { name: "Nextcloud", value: parsed.Nextcloud || 0, color: "#a855f7" }, // Purple
        { name: "Outline", value: parsed.Outline || 0, color: "#3b82f6" },     // Blue
        { name: "Stats", value: parsed.Stats || 0, color: "#ec4899" },         // Pink
        { name: "Autres", value: parsed.Autres || 0, color: "#f97316" },       // Orange
        { name: "Disponible", value: nvmeFree, color: "rgba(255, 255, 255, 0.1)" } // Semi-transparent white
      ].filter(item => item.value > 0);
    }
  } catch (e) {
    console.error("Failed to parse disk services JSON:", e);
  }

  // Fallback if JSON is empty or invalid
  if (servicesData.length === 0) {
    servicesData = [
      { name: "Nextcloud", value: parseFloat((nvmeUsed * 0.35).toFixed(1)), color: "#a855f7" },
      { name: "Outline", value: parseFloat((nvmeUsed * 0.15).toFixed(1)), color: "#3b82f6" },
      { name: "Stats", value: 1.2, color: "#ec4899" },
      { name: "Autres", value: parseFloat((nvmeUsed - (nvmeUsed * 0.35 + nvmeUsed * 0.15 + 1.2)).toFixed(1)), color: "#f97316" },
      { name: "Disponible", value: nvmeFree, color: "rgba(255, 255, 255, 0.1)" }
    ].filter(item => item.value > 0);
  }

  return (
    <div className="flex flex-col gap-10">
      {/* CPU & RAM Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 ml-1">Performances</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <MetricCard
            title="Processeur (CPU)"
            value={latest.cpu_usage}
            unit="%"
            icon={<Cpu className="h-4 w-4" />}
            description={`Température : ${latest.cpu_temp}°C`}
            color="blue"
            variant="circle"
          />
          <MetricCard
            title="Mémoire (RAM)"
            value={latest.ram_usage_percent.toFixed(1)}
            unit="%"
            icon={<Activity className="h-4 w-4" />}
            description={`Utilisé : ${(latest.ram_usage_mb / 1024).toFixed(1)} / ${(latest.ram_total_mb / 1024).toFixed(1)} Go`}
            color="red"
            variant="circle"
          />
        </div>
      </div>

      {/* Disks SSD Section (Increased gap & circles / pie chart) */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 ml-1">Stockage SSD</h2>
        <div className="flex flex-col gap-4">
          
          {/* NVMe SSD Service breakdown Donut Card */}
          <Card className="relative overflow-hidden glass-card-blended ring-0 bg-card/40 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(249,115,22,0.12)] group p-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 z-10 relative">
              {/* Left Details & Legend */}
              <div className="flex-1 flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="bg-zinc-800/30 p-2 rounded-lg border text-orange-400 border-orange-500/30 transition-all duration-300">
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-semibold tracking-wide text-muted-foreground/80">SSD NVMe (Système & Services)</CardTitle>
                </div>

                {/* Legend Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mt-1">
                  {servicesData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-foreground/90">{item.name} :</span>
                      <span className="text-muted-foreground">{item.value.toFixed(1)} Go</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Donut Chart */}
              <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={servicesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={46}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {servicesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-sm font-extrabold tracking-tight text-foreground">{nvmePercent}%</span>
                  <span className="text-[9px] font-semibold text-muted-foreground/50">Utilisé</span>
                </div>
              </div>
            </div>
          </Card>

          {/* SATA SSD Card (sauvegardes) */}
          <div className="grid gap-4 grid-cols-1">
            <MetricCard
              title="SSD SATA (Sauvegardes)"
              value={((latest.disk_sata_usage_gb / latest.disk_sata_total_gb) * 100).toFixed(1)}
              unit="%"
              icon={<HardDrive className="h-4 w-4" />}
              description={`Espace : ${latest.disk_sata_usage_gb} / ${latest.disk_sata_total_gb} Go`}
              color="orange"
              variant="circle"
            />
          </div>

        </div>
      </div>

      {/* Others Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 ml-1">Électricité & Activité</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <MetricCard
            title="Puissance"
            value={(latest.power_usage_w || 0).toFixed(1)}
            unit=" W"
            icon={<Zap className="h-4 w-4" />}
            description="Consommation estimée"
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
    </div>
  );
};
