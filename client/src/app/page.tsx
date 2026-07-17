"use client";

import { useEffect, useState } from "react";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { MetricsOverview } from "@/components/organisms/MetricsOverview";
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "history" | "logs">("dashboard");

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
      const interval = setInterval(() => fetchData(), 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [isMounted]);

  const Title = (
    <h1 className="text-xl font-bold tracking-tight text-violet-300">
      Stats Système
    </h1>
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
      refreshButton={null}
      overview={<MetricsOverview latest={latest} />}
      charts={<HistorySection history={history} />}
      table={<DataTable data={history} />}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      deviceName={latest?.device_name}
    />
  );
}
