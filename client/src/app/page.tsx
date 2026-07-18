"use client";

import { useEffect, useState } from "react";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { MetricsOverview } from "@/components/organisms/MetricsOverview";
import { ServicesSection } from "@/components/organisms/ServicesSection";
import { HistorySection } from "@/components/organisms/HistorySection";
import { DataTable } from "@/components/molecules/DataTable";
import { metricsService } from "@/services/api";
import { SystemMetric } from "@/types";
import { RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const [latest, setLatest] = useState<SystemMetric | null>(null);
  const [history, setHistory] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "services" | "history" | "logs">("dashboard");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [latestData, historyData] = await Promise.all([
        metricsService.getLatest(),
        metricsService.getHistory(50)
      ]);
      setLatest(latestData);
      setHistory(historyData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
      setError("Échec de la récupération des données depuis le serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);

  useEffect(() => {
    if (isMounted) {
      const interval = setInterval(() => fetchData(), 5000); // Refresh every 5s
      return () => clearInterval(interval);
    }
  }, [isMounted]);

  const Title = (
    <div className="flex items-center gap-2.5">
      <div className="relative h-8 w-8 opacity-[0.65] shrink-0 select-none">
        <img
          src="https://beskarfox.com/Assets/img/Beskarfox_TW.png"
          alt="Beskarfox Logo"
          className="h-full w-full object-contain"
          style={{ filter: "sepia(1) saturate(5) hue-rotate(230deg)" }}
        />
      </div>
      <h1 className="text-xl tracking-tight text-violet-300 font-bold">
        Dashboard
      </h1>
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin text-violet-400/60 ml-1.5 shrink-0" />
      )}
    </div>
  );

  const refreshButton = (
    <button
      onClick={() => fetchData()}
      disabled={loading}
      className="flex items-center justify-center p-2 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all cursor-pointer disabled:opacity-50"
      title="Actualiser les données"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-violet-400" : ""}`} />
    </button>
  );

  if (!isMounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (error && history.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive">Erreur</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => fetchData()}>Réessayer</Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardTemplate
      title={Title}
      refreshButton={refreshButton}
      overview={<MetricsOverview latest={latest} />}
      services={<ServicesSection latest={latest} />}
      charts={<HistorySection history={history} />}
      table={<DataTable data={history} />}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      deviceName={latest?.device_name}
    />
  );
}
