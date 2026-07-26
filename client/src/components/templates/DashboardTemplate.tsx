import { ReactNode, useState, useEffect } from "react";
import { LayoutDashboard, Database, TrendingUp, Server, Sword } from "lucide-react";

interface DashboardTemplateProps {
  title: ReactNode;
  refreshButton?: ReactNode;
  overview: ReactNode;
  charts: ReactNode;
  table: ReactNode;
  services: ReactNode;
  minecraft?: ReactNode;
  activeTab: "dashboard" | "services" | "history" | "minecraft";
  setActiveTab: (tab: "dashboard" | "services" | "history" | "minecraft") => void;
  deviceName?: string;
  historyToolbar?: ReactNode;
}

export const DashboardTemplate = ({
  title,
  refreshButton,
  overview,
  charts,
  table,
  services,
  minecraft,
  activeTab,
  setActiveTab,
  deviceName,
  historyToolbar
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
      <div className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/12 blur-[130px] pointer-events-none z-0" />
      <div className="fixed top-[25%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[15%] w-[550px] h-[550px] rounded-full bg-fuchsia-600/8 blur-[140px] pointer-events-none z-0" />

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
              onClick={() => setActiveTab("minecraft")}
              className={`flex items-center w-full px-4 py-2.5 text-sm font-medium tracking-wide rounded-xl transition-all duration-200 group cursor-pointer focus:outline-none focus-visible:outline-none border-0 bg-transparent ${
                activeTab === "minecraft"
                  ? "text-violet-300"
                  : "text-muted-foreground/70 hover:text-foreground"
              }`}
            >
              <Sword className={`mr-2.5 h-4 w-4 transition-colors duration-200 ${activeTab === "minecraft" ? "text-violet-300" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
              Minecraft
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
                  <div className="font-poppins text-4xl md:text-7xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-white/55 to-white/25 tracking-tight select-none">
                    {timeString || "--:--"}
                  </div>
                </div>
                {overview}
              </section>
            )}

            {activeTab === "services" && (
              <section className="pt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="font-poppins text-3xl font-bold tracking-tight text-zinc-400 ml-1 mb-6">Services</h2>
                {services}
              </section>
            )}

            {activeTab === "history" && (
              <section className="pt-16 animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-16">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-row items-center justify-between gap-4 ml-1 flex-wrap w-full">
                    <h2 className="font-poppins text-3xl font-bold tracking-tight text-zinc-400">Historique</h2>
                    {historyToolbar}
                  </div>
                  {charts}
                </div>
                <div className="pt-8 space-y-6">
                  <h3 className="font-poppins text-2xl font-bold tracking-tight text-zinc-400 ml-1">Journaux bruts</h3>
                  {table}
                </div>
              </section>
            )}

            {activeTab === "minecraft" && (
              <section className="pt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="font-poppins text-3xl font-bold tracking-tight text-zinc-400 ml-1 mb-6">Minecraft</h2>
                {minecraft}
              </section>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Nav Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-5 inset-x-0 mx-4 z-30 flex justify-center">
        <div className="flex items-center justify-between w-full max-w-[330px] px-2 py-2 rounded-3xl border border-white/10 bg-zinc-950/40 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`relative flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-2xl transition-all duration-300 cursor-pointer border-0 bg-transparent ${
              activeTab === "dashboard" ? "text-violet-300 scale-105" : "text-muted-foreground/60"
            }`}
          >
            {activeTab === "dashboard" && (
              <span className="absolute inset-0 bg-white/10 rounded-2xl -z-10" />
            )}
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-[9px] font-medium tracking-wide">Aperçu</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`relative flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-2xl transition-all duration-300 cursor-pointer border-0 bg-transparent ${
              activeTab === "history" ? "text-violet-300 scale-105" : "text-muted-foreground/60"
            }`}
          >
            {activeTab === "history" && (
              <span className="absolute inset-0 bg-white/10 rounded-2xl -z-10" />
            )}
            <TrendingUp className="h-4 w-4" />
            <span className="text-[9px] font-medium tracking-wide">Histoire</span>
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`relative flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-2xl transition-all duration-300 cursor-pointer border-0 bg-transparent ${
              activeTab === "services" ? "text-violet-300 scale-105" : "text-muted-foreground/60"
            }`}
          >
            {activeTab === "services" && (
              <span className="absolute inset-0 bg-white/10 rounded-2xl -z-10" />
            )}
            <Server className="h-4 w-4" />
            <span className="text-[9px] font-medium tracking-wide">Services</span>
          </button>
          <button
            onClick={() => setActiveTab("minecraft")}
            className={`relative flex flex-col items-center gap-1 py-1.5 px-2.5 rounded-2xl transition-all duration-300 cursor-pointer border-0 bg-transparent ${
              activeTab === "minecraft" ? "text-violet-300 scale-105" : "text-muted-foreground/60"
            }`}
          >
            {activeTab === "minecraft" && (
              <span className="absolute inset-0 bg-white/10 rounded-2xl -z-10" />
            )}
            <Sword className="h-4 w-4" />
            <span className="text-[9px] font-medium tracking-wide">Minecraft</span>
          </button>

        </div>
      </div>
    </div>
  );
};
