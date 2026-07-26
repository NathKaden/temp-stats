import { useState, useEffect, useRef } from "react";
import { MinecraftStatus } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Gamepad2,
  Users,
  Terminal,
  Search,
  MessageSquare,
  Play,
  Pause,
  RefreshCw,
  Download,
  Wifi,
  Info,
  AlertTriangle,
  XCircle,
  FileText
} from "lucide-react";

interface MinecraftSectionProps {
  status: MinecraftStatus | null;
  loading: boolean;
  onRefresh: () => void;
}

export const MinecraftSection = ({ status, loading, onRefresh }: MinecraftSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [logFilter, setLogFilter] = useState<"all" | "chat" | "info" | "warn" | "error">("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const [pausedLogs, setPausedLogs] = useState<string[]>([]);

  // Capture logs when not paused
  useEffect(() => {
    if (status && !isPaused) {
      setPausedLogs(status.logs);
    }
  }, [status, isPaused]);

  // Handle auto-scroll to bottom of logs console
  useEffect(() => {
    if (autoScroll && consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [pausedLogs, autoScroll]);

  if (!status && loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <RefreshCw className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!status) {
    return (
      <Card className="glass-card-blended bg-card/40 backdrop-blur-xl border border-white/5 p-6 text-center text-muted-foreground">
        Impossible de charger les statistiques Minecraft.
      </Card>
    );
  }

  // Parse log line for syntax highlighting
  const formatLogLine = (line: string) => {
    // Standard format: [HH:MM:SS] [thread/LEVEL]: Message
    const match = line.match(/^\[(\d{2}:\d{2}:\d{2})\]\s+\[([^\]]+)\]:\s+(.*)$/);
    if (!match) {
      return <span className="text-zinc-500">{line}</span>;
    }

    const [, time, threadAndLevel, message] = match;
    let level = "INFO";
    if (threadAndLevel.includes("WARN")) level = "WARN";
    if (threadAndLevel.includes("ERROR")) level = "ERROR";
    if (threadAndLevel.includes("FATAL")) level = "FATAL";

    // Highlight types of messages
    let messageColor = "text-zinc-300";
    let icon = null;

    if (message.startsWith("<") && message.includes(">")) {
      // Chat message
      messageColor = "text-fuchsia-300 font-semibold";
    } else if (message.includes("joined the game")) {
      messageColor = "text-emerald-400 font-medium";
    } else if (message.includes("left the game") || message.includes("lost connection")) {
      messageColor = "text-rose-400 font-medium";
    }

    let levelBadgeColor = "text-cyan-400";
    if (level === "WARN") levelBadgeColor = "text-amber-400 font-bold";
    if (level === "ERROR" || level === "FATAL") levelBadgeColor = "text-red-400 font-bold";

    return (
      <div className="leading-relaxed hover:bg-white/5 py-0.5 px-1 rounded transition-colors duration-100 flex items-start gap-2">
        <span className="text-zinc-500 select-none shrink-0 font-mono text-xs">[{time}]</span>
        <span className={`${levelBadgeColor} select-none shrink-0 font-mono text-xs`}>
          [{threadAndLevel}]
        </span>
        <span className={`${messageColor} font-mono text-xs break-all`}>{message}</span>
      </div>
    );
  };

  // Filter logs based on category and search term
  const filteredLogs = pausedLogs.filter((line) => {
    const matchesSearch = line.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (logFilter === "all") return true;
    
    const lowerLine = line.toLowerCase();
    const isInfo = lowerLine.includes("/info");
    const isWarn = lowerLine.includes("/warn");
    const isError = lowerLine.includes("/error") || lowerLine.includes("/fatal");
    const isChat = lowerLine.includes("]: <") && lowerLine.includes(">");

    if (logFilter === "chat") return isChat;
    if (logFilter === "info") return isInfo && !isChat;
    if (logFilter === "warn") return isWarn;
    if (logFilter === "error") return isError;
    return true;
  });

  // Action to download current logs as text file
  const downloadLogs = () => {
    const element = document.createElement("a");
    const file = new Blob([pausedLogs.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `minecraft_latest_${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
      {/* LEFT COLUMN: Status and Players list */}
      <div className="xl:col-span-1 flex flex-col gap-6">
        
        {/* Status Card */}
        <Card className="relative overflow-hidden glass-card-blended ring-0 bg-card/40 backdrop-blur-xl border border-white/5 shadow-xl p-6">
          <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none -z-10 transition-all duration-500" 
            style={{ 
              backgroundColor: status.online ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)" 
            }}
          />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${
                status.online 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}>
                <Gamepad2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground/90 leading-tight">Serveur de jeu</h3>
                <span className="text-xs text-muted-foreground/60">Minecraft (Paper)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={onRefresh}
                disabled={loading}
                className="p-2 rounded-lg bg-zinc-900/60 border border-white/5 text-muted-foreground hover:text-violet-300 hover:border-violet-500/20 transition-all cursor-pointer disabled:opacity-40"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-violet-400" : ""}`} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Status indicator */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
              <span className="text-xs font-semibold text-muted-foreground/50">Statut</span>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${status.online ? "bg-emerald-400 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
                <span className={`text-sm font-bold ${status.online ? "text-emerald-400" : "text-rose-400"}`}>
                  {status.online ? "En ligne" : "Hors ligne"}
                </span>
              </div>
            </div>

            {/* Version */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
              <span className="text-xs font-semibold text-muted-foreground/50">Version</span>
              <span className="text-sm font-medium text-foreground/80 font-mono">
                {status.online && status.version ? status.version : "--"}
              </span>
            </div>

            {/* Latency */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5">
              <span className="text-xs font-semibold text-muted-foreground/50">Latence</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground/80 font-mono">
                <Wifi className="h-3.5 w-3.5 text-muted-foreground/45" />
                <span>{status.online && status.latency_ms !== null ? `${status.latency_ms} ms` : "--"}</span>
              </div>
            </div>

            {/* MOTD */}
            {status.online && status.motd && (
              <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                <span className="block text-[10px] font-semibold text-muted-foreground/40 mb-1">MOTD</span>
                <span className="text-xs font-mono text-zinc-300 leading-relaxed block break-all whitespace-pre-wrap">
                  {status.motd}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Players Card */}
        <Card className="flex-1 glass-card-blended ring-0 bg-card/40 backdrop-blur-xl border border-white/5 shadow-xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-foreground/90 font-bold">
              <Users className="h-4 w-4 text-violet-400" />
              <span>Joueurs connectés</span>
            </div>
            <span className="text-xs font-mono font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded-lg">
              {status.players_online} / {status.players_max}
            </span>
          </div>

          {/* Player list scrollable */}
          <div className="flex-1 overflow-y-auto max-h-[300px] xl:max-h-[none] space-y-2.5 pr-1.5 custom-scrollbar min-h-[150px]">
            {status.online && status.players_online > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
                {status.players_list.map((player) => (
                  <div 
                    key={player}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-black/10 border border-white/5 hover:border-white/10 hover:bg-black/20 transition-all duration-150"
                  >
                    <div className="h-8 w-8 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-zinc-900 flex items-center justify-center">
                      <img 
                        src={`https://mc-heads.net/avatar/${player}/32`}
                        alt={`${player} head`}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          // Fallback to generic Steve head if load fails
                          (e.target as HTMLImageElement).src = "https://mc-heads.net/avatar/Steve/32";
                        }}
                      />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-foreground/90 truncate leading-snug">
                        {player}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-medium">actif</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground/50 gap-2">
                <Users className="h-8 w-8 opacity-25" />
                <p className="text-xs font-medium">Aucun joueur connecté actuellement</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* RIGHT COLUMN: Interactive Console/Logs */}
      <div className="xl:col-span-2 flex">
        <Card className="flex-grow glass-card-blended ring-0 bg-card/40 backdrop-blur-xl border border-white/5 shadow-xl flex flex-col overflow-hidden min-h-[500px]">
          {/* Console Header */}
          <div className="px-5 py-4 border-b border-white/5 bg-zinc-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Terminal mock buttons */}
              <div className="flex gap-1.5 mr-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/70" />
                <span className="w-3 h-3 rounded-full bg-amber-500/70" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
              </div>
              <Terminal className="h-4 w-4 text-violet-400" />
              <h3 className="font-bold text-sm tracking-wide text-foreground/80">Console Serveur (latest.log)</h3>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Play/Pause refresh stream */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  isPaused
                    ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    : "bg-zinc-900/60 text-muted-foreground border-white/5 hover:text-foreground hover:bg-zinc-900"
                }`}
                title={isPaused ? "Reprendre le flux en direct" : "Geler le flux des logs"}
              >
                {isPaused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                <span>{isPaused ? "Gelé" : "Actif"}</span>
              </button>

              {/* Download Logs */}
              <button
                onClick={downloadLogs}
                className="p-1.5 rounded-lg bg-zinc-900/60 border border-white/5 text-muted-foreground hover:text-violet-300 hover:border-violet-500/20 transition-all cursor-pointer"
                title="Télécharger les logs actuels"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Log Filters and Search Toolbar */}
          <div className="px-5 py-3 border-b border-white/5 bg-zinc-950/20 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
            {/* Filter buttons */}
            <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
              {(["all", "chat", "info", "warn", "error"] as const).map((filter) => {
                const labels = {
                  all: "Tous",
                  chat: "Tchat",
                  info: "Infos",
                  warn: "Alertes",
                  error: "Erreurs"
                };
                const activeColors = {
                  all: "bg-white/10 text-violet-300 border-white/10",
                  chat: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
                  info: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
                  warn: "bg-amber-500/10 text-amber-300 border-amber-500/20",
                  error: "bg-red-500/10 text-red-300 border-red-500/20"
                };
                return (
                  <button
                    key={filter}
                    onClick={() => setLogFilter(filter)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer shrink-0 ${
                      logFilter === filter
                        ? activeColors[filter]
                        : "bg-transparent text-muted-foreground/60 border-transparent hover:text-foreground"
                    }`}
                  >
                    {labels[filter]}
                  </button>
                );
              })}
            </div>

            {/* Keyword Search */}
            <div className="relative flex-grow md:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/45 pointer-events-none" />
              <input
                type="text"
                placeholder="Rechercher dans les logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1 text-xs rounded-lg border border-white/5 bg-black/20 text-foreground placeholder-muted-foreground/40 focus:outline-none focus:border-violet-500/30 transition-all font-mono"
              />
            </div>
          </div>

          {/* Console Text Container */}
          <div className="flex-grow p-4 bg-black/45 overflow-y-auto font-mono custom-scrollbar max-h-[500px]">
            {filteredLogs.length > 0 ? (
              <div className="space-y-0.5">
                {filteredLogs.map((line, index) => (
                  <div key={index}>{formatLogLine(line)}</div>
                ))}
                <div ref={consoleEndRef} />
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground/40 py-12 gap-1.5 font-sans">
                <FileText className="h-6 w-6 opacity-30" />
                <span className="text-xs font-medium">Aucune ligne de log correspondante</span>
              </div>
            )}
          </div>

          {/* Console Footer */}
          <div className="px-5 py-2.5 border-t border-white/5 bg-zinc-950/40 flex items-center justify-between shrink-0 text-[10px] text-muted-foreground/40 font-mono">
            <div className="flex items-center gap-4">
              <span>Total: {pausedLogs.length} lignes</span>
              {filteredLogs.length !== pausedLogs.length && (
                <span className="text-violet-400/80">Filtré: {filteredLogs.length} lignes</span>
              )}
            </div>
            
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded border-white/10 bg-black/40 text-violet-500 focus:ring-0 focus:ring-offset-0 h-3 w-3"
              />
              <span>Défilement auto.</span>
            </label>
          </div>
        </Card>
      </div>
    </div>
  );
};
