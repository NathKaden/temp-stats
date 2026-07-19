import { SystemMetric } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, BookOpen, Activity, Cpu, HardDrive, Globe, ExternalLink } from "lucide-react";

interface ServicesSectionProps {
  latest: SystemMetric | null;
}

export const ServicesSection = ({ latest }: ServicesSectionProps) => {
  if (!latest) return null;

  // 1. Parse RAM services usage
  let ramUsage: Record<string, number> = { Beskarfox: 0, Nextcloud: 0, Outline: 0, Stats: 0 };
  try {
    if (latest.ram_services_json) {
      ramUsage = JSON.parse(latest.ram_services_json);
    }
  } catch (e) {
    console.error("Failed to parse RAM services JSON:", e);
  }

  // 2. Parse Disk services usage
  let diskUsage: Record<string, number> = { Beskarfox: 0, Nextcloud: 0, Outline: 0, Stats: 0 };
  try {
    if (latest.disk_services_json) {
      diskUsage = JSON.parse(latest.disk_services_json);
    }
  } catch (e) {
    console.error("Failed to parse Disk services JSON:", e);
  }

  // 3. Define services list with icons, colors, domains and names
  const servicesList = [
    {
      name: "Beskarfox",
      key: "Beskarfox",
      description: "Site principal",
      url: "https://beskarfox.com",
      displayUrl: "beskarfox.com",
      icon: <Globe className="h-6 w-6" />,
      color: "emerald",
      glowColor: "rgba(168, 85, 247, 0.12)",
      iconBg: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
      hasMetrics: true
    },
    {
      name: "Nextcloud",
      key: "Nextcloud",
      description: "Stockage cloud",
      url: "https://cloud.beskarfox.com",
      displayUrl: "cloud.beskarfox.com",
      icon: <Cloud className="h-6 w-6" />,
      color: "blue",
      glowColor: "rgba(59, 130, 246, 0.12)",
      iconBg: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      hasMetrics: true
    },
    {
      name: "Stats",
      key: "Stats",
      description: "Dashboard",
      url: "https://stats.beskarfox.com",
      displayUrl: "stats.beskarfox.com",
      icon: <Activity className="h-6 w-6" />,
      color: "purple",
      glowColor: "rgba(168, 85, 247, 0.12)",
      iconBg: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
      hasMetrics: true
    },
    {
      name: "Outline",
      key: "Outline",
      description: "Docs",
      url: "https://outline.beskarfox.com",
      displayUrl: "outline.beskarfox.com",
      icon: <BookOpen className="h-6 w-6" />,
      color: "indigo",
      glowColor: "rgba(99, 102, 241, 0.12)",
      iconBg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
      hasMetrics: true
    },
  ];

  // Helper function to render each service card
  const renderCard = (service: typeof servicesList[0]) => {
    const memMb = ramUsage[service.key] || 0;
    const diskGb = diskUsage[service.key] || 0;
    const isActive = memMb > 0 || !service.hasMetrics;

    const formattedMem = memMb >= 1024
      ? `${(memMb / 1024).toFixed(1)} Go`
      : `${memMb.toFixed(0)} Mo`;

    return (
      <Card
        key={service.name}
        className="relative overflow-hidden glass-card-blended ring-0 bg-card/40 backdrop-blur-xl transition-shadow duration-150 ease-out shadow-xl hover:shadow-[0_0_20px_var(--glow)] group p-6 flex flex-col justify-between"
        style={{ "--glow": service.glowColor } as React.CSSProperties}
      >
        <div>
          {/* Header Block */}
          <div className="flex items-start gap-4 mb-6">
            <div className={`p-2.5 rounded-xl shrink-0 ${service.iconBg}`}>
              {service.icon}
            </div>
            <div className="flex flex-col">
              <CardTitle className="text-lg font-bold tracking-wide text-foreground/90">
                {service.name}
              </CardTitle>
              <span className="text-xs text-muted-foreground/60 leading-normal">
                {service.description}
              </span>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {service.hasMetrics ? (
              <>
                {/* RAM Usage Block */}
                <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/50">
                    <Cpu className="h-3.5 w-3.5 text-muted-foreground/45" />
                    <span>Mémoire RAM</span>
                  </div>
                  <span className="text-lg font-semibold tracking-tight text-foreground/90">
                    {isActive ? formattedMem : "--"}
                  </span>
                </div>

                {/* Disk Space Block */}
                <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-black/20 border border-white/5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/50">
                    <HardDrive className="h-3.5 w-3.5 text-muted-foreground/45" />
                    <span>Espace Disque</span>
                  </div>
                  <span className="text-lg font-semibold tracking-tight text-foreground/90">
                    {diskGb > 0 ? `${diskGb.toFixed(1)} Go` : "--"}
                  </span>
                </div>
              </>
            ) : (
              <div className="col-span-2 flex items-center justify-center p-6 rounded-xl bg-black/20 border border-white/5 text-xs text-muted-foreground/50 font-medium text-center">
                TODO
              </div>
            )}
          </div>
        </div>

        {/* Link Footer */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center">
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-muted-foreground/75 hover:text-violet-300 transition-colors flex items-center gap-1.5 group/link"
          >
            <span>{service.displayUrl}</span>
            <ExternalLink className="h-3 w-3 opacity-60 transition-all" />
          </a>
        </div>
      </Card>
    );
  };

  // Group services so Stats is in Col 1 (directly below Beskarfox) and Outline is in Col 2 (below Nextcloud)
  const col1 = [servicesList[0], servicesList[2]]; // Beskarfox, Stats
  const col2 = [servicesList[1], servicesList[3]]; // Nextcloud, Outline

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
      {/* Column 1 (Beskarfox & Stats) */}
      <div className="flex flex-col gap-6">
        {col1.map(renderCard)}
      </div>
      {/* Column 2 (Nextcloud & Outline) */}
      <div className="flex flex-col gap-6">
        {col2.map(renderCard)}
      </div>
    </div>
  );
};
