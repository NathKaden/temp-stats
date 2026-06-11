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
  selectedDevice: string;
  setSelectedDevice: (device: string) => void;
  devices: string[];
}

export const DashboardTemplate = ({ 
  title, 
  refreshButton, 
  overview, 
  charts, 
  table, 
  activeTab, 
  setActiveTab,
  selectedDevice,
  setSelectedDevice,
  devices
}: DashboardTemplateProps) => {
  return (
    <div className="relative flex min-h-screen flex-col md:flex-row bg-background text-foreground bg-grid-pattern overflow-hidden">
      {/* Modern Aurora / Mesh gradient glowing background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-violet-600/12 blur-[130px] pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[15%] w-[550px] h-[550px] rounded-full bg-fuchsia-600/8 blur-[140px] pointer-events-none z-0" />

      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-border/40 bg-zinc-950/20 backdrop-blur-xl z-20">
        <div className="flex flex-col h-full pt-6 pb-0 overflow-y-auto">
          {/* Logo / Title */}
          <div className="flex items-center px-6 mb-8 gap-2.5">
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <div className="flex-1">{title}</div>
          </div>

          {/* Device Selector (Desktop) */}
          {devices.length > 0 && (
            <div className="px-3 mb-6">
              <div className="relative">
                <select
                  value={selectedDevice}
                  onChange={(e) => setSelectedDevice(e.target.value)}
                  className="w-full bg-zinc-900/50 hover:bg-zinc-800/50 border border-border/60 hover:border-indigo-500/30 text-xs font-semibold tracking-wider text-muted-foreground hover:text-foreground py-2.5 pl-3.5 pr-8 rounded-xl appearance-none cursor-pointer transition-all duration-300 outline-none"
                >
                  {devices.map((device) => (
                    <option key={device} value={device} className="bg-zinc-950 text-foreground text-xs font-semibold py-2">
                      {device.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-muted-foreground/60">
                  <svg className="fill-current h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

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
          <div className="border-t border-border/40 bg-background/10 py-5 px-6 text-center text-[10px] text-muted-foreground/45 tracking-wider font-mono">
            v1.0.0 &bull; commit cd996dd
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col md:pl-60 z-10">
        {/* Header - Mobile Only */}
        <header className="md:hidden sticky top-0 z-10 border-b border-border/40 bg-background/65 backdrop-blur-md transition-all">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
            {title}
            <div className="flex items-center gap-2">
              {devices.length > 0 && (
                <div className="relative scale-90">
                  <select
                    value={selectedDevice}
                    onChange={(e) => setSelectedDevice(e.target.value)}
                    className="bg-zinc-900/50 border border-border/60 text-[10px] font-bold tracking-wider text-muted-foreground py-1.5 pl-2.5 pr-6 rounded-lg appearance-none cursor-pointer outline-none"
                  >
                    {devices.map((device) => (
                      <option key={device} value={device} className="bg-zinc-950 text-foreground text-[10px]">
                        {device.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-muted-foreground/60">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
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
        <footer className="md:hidden border-t border-border/40 bg-background/20 backdrop-blur-md py-6 pb-20">
          <div className="container mx-auto px-4 text-center text-xs text-muted-foreground/45 tracking-wider font-mono">
            v1.0.0 &bull; commit cd996dd
          </div>
        </footer>
      </div>

      {/* Bottom Nav Bar - Mobile Only */}
      <div className="md:hidden fixed bottom-0 inset-x-0 border-t border-border/45 bg-zinc-950/80 backdrop-blur-xl z-20 py-3 px-6 flex justify-around items-center">
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
