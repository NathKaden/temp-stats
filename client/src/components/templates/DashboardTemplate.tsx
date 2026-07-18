import { ReactNode, useState, useEffect } from "react";
import { LayoutDashboard, Database, TrendingUp, Server } from "lucide-react";

interface DashboardTemplateProps {
  title: ReactNode;
  refreshButton: ReactNode;
  overview: ReactNode;
  charts: ReactNode;
  table: ReactNode;
  services: ReactNode;
  activeTab: "dashboard" | "services" | "history" | "logs";
  setActiveTab: (tab: "dashboard" | "services" | "history" | "logs") => void;
  deviceName?: string;
}

export const DashboardTemplate = ({
  title,
  refreshButton,
  overview,
  charts,
  table,
  services,
  activeTab,
  setActiveTab,
  deviceName
}: DashboardTemplateProps) => {
  const [timeString, setTimeString] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setTimeString(`${hrs}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="relative flex min-h-screen flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Modern Aurora / Mesh gradient glowing background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/12 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[15%] w-[550px] h-[550px] rounded-full bg-fuchsia-600/8 blur-[140px] pointer-events-none z-0" />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-border/30 bg-zinc-950/20 backdrop-blur-xl z-20">
        <div className="flex flex-col h-full pt-6 pb-0 overflow-y-auto">
          {/* Logo / Title */}
          <div className="flex items-center px-6 mb-8 gap-2.5">
            <div className="flex-1">{title}</div>
          </div>

          {/* Nav Links */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center w-full px-4 py-2.5 text-sm font-medium tracking-wide rounded-xl transition-all duration-200 group cursor-pointer focus:outline-none focus-visible:outline-none border-0 bg-transparent ${
                activeTab === "dashboard"
                  ? "text-violet-300"
                  : "text-muted-foreground/70 hover:text-foreground"
              }`}
            >
              <LayoutDashboard className={`mr-2.5 h-4 w-4 transition-colors duration-200 ${activeTab === "dashboard" ? "text-violet-300" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
              Tableau de bord
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`flex items-center w-full px-4 py-2.5 text-sm font-medium tracking-wide rounded-xl transition-all duration-200 group cursor-pointer focus:outline-none focus-visible:outline-none border-0 bg-transparent ${
                activeTab === "services"
                  ? "text-violet-300"
                  : "text-muted-foreground/70 hover:text-foreground"
              }`}
            >
              <Server className={`mr-2.5 h-4 w-4 transition-colors duration-200 ${activeTab === "services" ? "text-violet-300" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
              Services
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center w-full px-4 py-2.5 text-sm font-medium tracking-wide rounded-xl transition-all duration-200 group cursor-pointer focus:outline-none focus-visible:outline-none border-0 bg-transparent ${
                activeTab === "history"
                  ? "text-violet-300"
                  : "text-muted-foreground/70 hover:text-foreground"
              }`}
            >
              <TrendingUp className={`mr-2.5 h-4 w-4 transition-colors duration-200 ${activeTab === "history" ? "text-violet-300" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
              Historique
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex items-center w-full px-4 py-2.5 text-sm font-medium tracking-wide rounded-xl transition-all duration-200 group cursor-pointer focus:outline-none focus-visible:outline-none border-0 bg-transparent ${
                activeTab === "logs"
                  ? "text-violet-300"
                  : "text-muted-foreground/70 hover:text-foreground"
              }`}
            >
              <Database className={`mr-2.5 h-4 w-4 transition-colors duration-200 ${activeTab === "logs" ? "text-violet-300" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
              Journaux bruts
            </button>
          </nav>

          {/* Refresh Action in Sidebar (Desktop) */}
          {refreshButton && (
            <div className="px-3 mt-auto mb-4">
              {refreshButton}
            </div>
          )}

          {/* Footer in Sidebar (Desktop) */}
          <div className={`${refreshButton ? "" : "mt-auto"} border-t border-border/30 bg-background/10 py-4 px-6 text-center text-[10px] text-muted-foreground/45 tracking-wider font-mono`}>
            ver. cd996dd
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col md:pl-60 z-10">
        {/* Header - Mobile Only */}
        <header className="md:hidden sticky top-0 z-10 border-b border-border/30 bg-background/65 backdrop-blur-md transition-all">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
            {title}
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-muted-foreground/45 tracking-wider pr-1">
                ver. cd996dd
              </span>
              {refreshButton && (
                <div className="scale-90 transform origin-right">
                  {refreshButton}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-7xl flex-grow px-4 sm:px-6 lg:px-8 py-8 pb-28 md:pb-8">
          <div className="flex flex-col gap-10">
            {activeTab === "dashboard" && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-end pr-4 md:pr-0 pt-4 pb-6">
                  <div className="font-poppins text-4xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-white/10 to-white/25 tracking-tight select-none">
                    {timeString || "--:--"}
                  </div>
                </div>
                {overview}
              </section>
            )}

            {activeTab === "services" && (
              <section className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-lg font-semibold tracking-wider text-muted-foreground/50 ml-1 mb-4">Services</h2>
                {services}
              </section>
            )}

            {activeTab === "history" && (
              <section className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-lg font-semibold tracking-wider text-muted-foreground/50 ml-1 mb-4">Historique</h2>
                {charts}
              </section>
            )}

            {activeTab === "logs" && (
              <section className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-lg font-semibold tracking-wider text-muted-foreground/50 ml-1 mb-4">Journaux de données brutes</h2>
                {table}
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Nav Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 inset-x-0 border-t border-border/30 bg-zinc-950/80 backdrop-blur-xl z-20 py-3 px-6 flex justify-around items-center">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1.5 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:outline-none ${
            activeTab === "dashboard" ? "text-violet-300" : "text-muted-foreground/75"
          }`}
        >
          <LayoutDashboard className="h-4.5 w-4.5 transition-colors duration-200" />
          <span className="text-[10px] font-semibold tracking-wide">Aperçu</span>
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`flex flex-col items-center gap-1.5 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:outline-none ${
            activeTab === "services" ? "text-violet-300" : "text-muted-foreground/75"
          }`}
        >
          <Server className="h-4.5 w-4.5 transition-colors duration-200" />
          <span className="text-[10px] font-semibold tracking-wide">Services</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex flex-col items-center gap-1.5 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:outline-none ${
            activeTab === "history" ? "text-violet-300" : "text-muted-foreground/75"
          }`}
        >
          <TrendingUp className="h-4.5 w-4.5 transition-colors duration-200" />
          <span className="text-[10px] font-semibold tracking-wide">Historique</span>
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex flex-col items-center gap-1.5 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:outline-none ${
            activeTab === "logs" ? "text-violet-300" : "text-muted-foreground/75"
          }`}
        >
          <Database className="h-4.5 w-4.5 transition-colors duration-200" />
          <span className="text-[10px] font-semibold tracking-wide">Journaux</span>
        </button>
      </div>
    </div>
  );
};
