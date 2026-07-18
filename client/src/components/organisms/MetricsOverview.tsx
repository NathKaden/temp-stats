import { MetricCard } from "@/components/atoms/MetricCard";
import { SystemMetric } from "@/types";
import { Cpu, HardDrive, ChartNoAxesColumnIncreasing, MemoryStick, Zap, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        { name: "Autres", value: parsed.Autres || 0, color: "#f94a29" },       // Reddish Orange (Autres)
        { name: "Disponible", value: nvmeFree, color: "rgba(255, 255, 255, 0.1)" } // Semi-transparent white
      ].filter(item => item.value > 0);
    }
  } catch (e) {
    console.error("Failed to parse disk services JSON:", e);
  }

  // Fallback if JSON is empty or invalid
  if (servicesData.length === 0) {
    const statsMock = 1.2;
    const statsVal = Math.min(nvmeUsed, statsMock);
    const autresVal = Math.max(0, parseFloat((nvmeUsed - statsVal).toFixed(1)));

    servicesData = [
      { name: "Stats", value: statsVal, color: "#ec4899" },
      { name: "Autres", value: autresVal, color: "#f94a29" },
      { name: "Disponible", value: nvmeFree, color: "rgba(255, 255, 255, 0.1)" }
    ].filter(item => item.value > 0);
  }

  // Calculate used, total and free memory for RAM
  const ramUsed = (latest.ram_usage_mb || 0.0) / 1024.0;
  const ramTotal = (latest.ram_total_mb || 1.0) / 1024.0;
  const ramFree = Math.max(0, parseFloat((ramTotal - ramUsed).toFixed(2)));
  const ramPercent = latest.ram_usage_percent.toFixed(1);

  // Parse the RAM services breakdown JSON
  let ramServicesData: { name: string; value: number; color: string }[] = [];
  try {
    if (latest.ram_services_json) {
      const parsed = JSON.parse(latest.ram_services_json);

      // Convert MB values to GB for chart data
      const nextcloudGb = (parsed.Nextcloud || 0) / 1024.0;
      const outlineGb = (parsed.Outline || 0) / 1024.0;
      const statsGb = (parsed.Stats || 0) / 1024.0;

      const knownServicesGb = nextcloudGb + outlineGb + statsGb;
      const autresGb = Math.max(0, ramUsed - knownServicesGb);

      ramServicesData = [
        { name: "Nextcloud", value: nextcloudGb, color: "#a855f7" }, // Purple
        { name: "Outline", value: outlineGb, color: "#3b82f6" },     // Blue
        { name: "Stats", value: statsGb, color: "#ec4899" },         // Pink
        { name: "Autres", value: autresGb, color: "#f94a29" },       // Reddish Orange (Autres)
        { name: "Disponible", value: ramFree, color: "rgba(255, 255, 255, 0.1)" }
      ].filter(item => item.value > 0);
    }
  } catch (e) {
    console.error("Failed to parse RAM services JSON:", e);
  }

  // Fallback if RAM JSON is empty or invalid
  if (ramServicesData.length === 0) {
    const statsMockGb = 0.15; // 150MB
    const statsValGb = Math.min(ramUsed, statsMockGb);
    const autresValGb = Math.max(0, ramUsed - statsValGb);

    ramServicesData = [
      { name: "Stats", value: statsValGb, color: "#ec4899" },
      { name: "Autres", value: autresValGb, color: "#f94a29" },
      { name: "Disponible", value: ramFree, color: "rgba(255, 255, 255, 0.1)" }
    ].filter(item => item.value > 0);
  }

  return (
    <div className="flex flex-col gap-10">
      {/* CPU & RAM Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-wider text-muted-foreground/50 ml-1">Utilisation</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">

          {/* CPU Card */}
          <MetricCard
            title="CPU"
            subTitle={latest.cpu_name || "Processeur"}
            value={latest.cpu_usage}
            unit="%"
            icon={<Cpu className="h-6 w-6" />}
            description={`Température : ${latest.cpu_temp}°C`}
            color="blue"
            variant="circle"
          />

          {/* RAM Service breakdown Donut Card */}
          <Card className="relative overflow-hidden glass-card-blended ring-0 bg-card/40 backdrop-blur-xl transition-shadow duration-150 ease-out hover:shadow-[0_0_20px_rgba(255,44,76,0.18)] group p-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 z-10 relative">
              {/* Left Details & Legend */}
              <div className="flex-1 flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="text-[#ff2c4c] transition-all duration-300 shrink-0">
                    <MemoryStick className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-base font-bold tracking-wide text-foreground/90">Mémoire</CardTitle>
                    <span className="text-sm text-muted-foreground/55 font-semibold -mt-0.5">RAM</span>
                  </div>
                </div>

                {/* Legend Grid */}
                <div className="grid grid-cols-2 gap-3 w-full mt-1">
                  {ramServicesData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-foreground/90">{item.name} :</span>
                      <span className="text-muted-foreground">
                        {item.name === "Disponible"
                          ? `${item.value.toFixed(1)} Go`
                          : item.value >= 1.0
                            ? `${item.value.toFixed(1)} Go`
                            : `${(item.value * 1024).toFixed(0)} Mo`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Donut Chart */}
              <div className="relative h-28 w-28 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ramServicesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={44}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={3}
                    >
                      {ramServicesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <div className="flex items-baseline text-foreground">
                    <span className="text-xl font-extrabold tracking-tight">{ramPercent}</span>
                    <span className="text-sm font-bold text-muted-foreground/60 ml-0.5">%</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground/50">Utilisé</span>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* Disks SSD Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-wider text-muted-foreground/50 ml-1">Stockage</h2>
        <div className="flex flex-col gap-4">

          {/* NVMe SSD Service breakdown Donut Card */}
          <Card className="relative overflow-hidden glass-card-blended ring-0 bg-card/40 backdrop-blur-xl transition-shadow duration-150 ease-out hover:shadow-[0_0_20px_rgba(249,74,41,0.12)] group p-5">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 z-10 relative">
              {/* Left Details & Legend */}
              <div className="flex-1 flex flex-col gap-4 w-full">
                <div className="flex items-center gap-3">
                  <div className="text-[#f94a29] transition-all duration-300 shrink-0">
                    <HardDrive className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold tracking-wide text-foreground/90">SSD NVMe</CardTitle>
                      {latest && (
                        <span className="text-sm font-semibold text-muted-foreground/55 select-none ml-1">
                          {latest.disk_temp}°C
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground/55 font-semibold -mt-0.5">Système & Services</span>
                  </div>
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
              <div className="relative h-32 w-32 shrink-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={servicesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={3}
                    >
                      {servicesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center">
                  <div className="flex items-baseline text-foreground">
                    <span className="text-2xl font-extrabold tracking-tight">{nvmePercent}</span>
                    <span className="text-sm font-bold text-muted-foreground/60 ml-0.5">%</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground/50">Utilisé</span>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 grid-cols-1">
            <MetricCard
              title={
                <div className="flex items-center gap-2">
                  <span>SSD SATA</span>
                  {latest && (
                    <span className="text-sm font-semibold text-muted-foreground/55 select-none">
                      {latest.disk_temp}°C
                    </span>
                  )}
                </div>
              }
              subTitle="Backups"
              value={((latest.disk_sata_usage_gb / latest.disk_sata_total_gb) * 100).toFixed(1)}
              unit="%"
              icon={<HardDrive className="h-6 w-6" />}
              description={`Espace : ${latest.disk_sata_usage_gb} / ${latest.disk_sata_total_gb} Go`}
              color="orange"
              variant="circle"
            />
          </div>

        </div>
      </div>

      {/* Others Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-wider text-muted-foreground/50 ml-1">Activité</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <MetricCard
            title="Puissance"
            value={(latest.power_usage_w || 0).toFixed(1)}
            unit=" W"
            icon={<Zap className="h-6 w-6" />}
            description="Consommation estimée"
            color="yellow"
          />
          <MetricCard
            title="Réseau"
            value={(latest.net_rx_mb + latest.net_tx_mb).toFixed(2)}
            unit=" Mo/s"
            icon={<ArrowUpDown className="h-6 w-6" />}
            description={`Entrant : ${latest.net_rx_mb.toFixed(2)} Mo/s • Sortant : ${latest.net_tx_mb.toFixed(2)} Mo/s`}
            color="indigo"
          />
          <MetricCard
            title="Temps d'activité"
            value={latest.uptime.split(',')[0]}
            icon={<ChartNoAxesColumnIncreasing className="h-6 w-6" />}
            description={latest.uptime.replace("actif depuis ", "")}
            color="yellow-muted"
          />
        </div>
      </div>
    </div>
  );
};
