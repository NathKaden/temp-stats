import { ReactNode } from "react";
import { LayoutDashboard, Database } from "lucide-react";

interface DashboardTemplateProps {
  title: ReactNode;
  refreshButton: ReactNode;
  overview: ReactNode;
  charts: ReactNode;
  table: ReactNode;
  activeTab: "dashboard" | "logs";
  setActiveTab: (tab: "dashboard" | "logs") => void;
  deviceName?: string;
}

export const DashboardTemplate = ({ 
  title, 
  refreshButton, 
  overview, 
  charts, 
  table, 
  activeTab, 
  setActiveTab,
  deviceName
}: DashboardTemplateProps) => {
  return (
    <div className="relative flex min-h-screen flex-col md:flex-row bg-background text-foreground bg-grid-pattern overflow-hidden">
      {/* Modern Aurora / Mesh gradient glowing background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/12 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[15%] w-[550px] h-[550px] rounded-full bg-fuchsia-600/8 blur-[140px] pointer-events-none z-0" />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-border/30 bg-zinc-950/20 backdrop-blur-xl z-20">
        <div className="flex flex-col h-full pt-6 pb-0 overflow-y-auto">
          {/* Logo / Title */}
          <div className="flex items-center px-6 mb-8 gap-2.5">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <div className="flex-1">{title}</div>
          </div>

          {/* Active Machine Display (Desktop) */}
          <div className="px-3 mb-6">
            <div className="flex flex-col gap-1.5 py-3 px-4 rounded-xl bg-zinc-900/30 border border-border/20 backdrop-blur-md">
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground/50 uppercase">Monitored Host</span>
              <span className="text-xs font-mono font-semibold text-violet-300 truncate tracking-wide">
                {deviceName || "loading..."}
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-3 space-y-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center w-full px-4 py-2.5 text-xs font-semibold tracking-wider uppercase rounded-xl transition-all duration-200 group cursor-pointer focus:outline-none focus-visible:outline-none border-0 ${
                activeTab === "dashboard"
                  ? "bg-card/15 text-violet-300 backdrop-blur-xl glass-btn-blended shadow-lg shadow-black/10"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-zinc-800/10"
              }`}
            >
              <LayoutDashboard className={`mr-2.5 h-4 w-4 ${activeTab === "dashboard" ? "text-violet-400" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex items-center w-full px-4 py-2.5 text-xs font-semibold tracking-wider uppercase rounded-xl transition-all duration-200 group cursor-pointer focus:outline-none focus-visible:outline-none border-0 ${
                activeTab === "logs"
                  ? "bg-card/15 text-violet-300 backdrop-blur-xl glass-btn-blended shadow-lg shadow-black/10"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-zinc-800/10"
              }`}
            >
              <Database className={`mr-2.5 h-4 w-4 ${activeTab === "logs" ? "text-violet-400" : "text-muted-foreground/60 group-hover:text-foreground"}`} />
              Raw Logs
            </button>
          </nav>

          {/* Refresh Action in Sidebar (Desktop) */}
          <div className="px-3 mt-auto mb-4">
            {refreshButton}
          </div>

          {/* Footer in Sidebar (Desktop) */}
          <div className="border-t border-border/30 bg-background/10 py-5 px-6 text-center text-[10px] text-muted-foreground/45 tracking-wider font-mono">
            v1.0.0 &bull; commit cd996dd
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
              {deviceName && (
                <div className="px-2 py-1 rounded bg-zinc-900/40 border border-border/20 font-mono text-[10px] font-semibold text-violet-300 truncate max-w-[120px]">
                  {deviceName}
                </div>
              )}
              <div className="scale-90 transform origin-right">
                {refreshButton}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto max-w-5xl flex-grow px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col gap-10">
            {activeTab === "dashboard" && (
              <>
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Latest Capture</h2>
                  {overview}
                </section>
                
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Historical Trends</h2>
                  {charts}
                </section>
              </>
            )}

            {activeTab === "logs" && (
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="mb-4 text-xs font-semibold tracking-widest text-muted-foreground uppercase">Raw Data Logs</h2>
                {table}
              </section>
            )}
          </div>
        </main>

        {/* Footer - Mobile Only */}
        <footer className="md:hidden border-t border-border/30 bg-background/20 backdrop-blur-md py-6 pb-20">
          <div className="container mx-auto px-4 text-center text-xs text-muted-foreground/45 tracking-wider font-mono">
            v1.0.0 &bull; commit cd996dd
          </div>
        </footer>
      </div>

      {/* Bottom Nav Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 inset-x-0 border-t border-border/30 bg-zinc-950/80 backdrop-blur-xl z-20 py-3 px-6 flex justify-around items-center">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:outline-none ${
            activeTab === "dashboard" ? "text-violet-300" : "text-muted-foreground/75"
          }`}
        >
          <LayoutDashboard className="h-4.5 w-4.5" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer focus:outline-none focus-visible:outline-none ${
            activeTab === "logs" ? "text-violet-300" : "text-muted-foreground/75"
          }`}
        >
          <Database className="h-4.5 w-4.5" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Logs</span>
        </button>
      </div>
    </div>
  );
};
