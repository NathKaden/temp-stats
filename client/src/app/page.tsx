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
  const [activeTab, setActiveTab] = useState<"dashboard" | "logs">("dashboard");

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
      setError("Failed to fetch data from the server.");
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
      const interval = setInterval(() => fetchData(), 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [isMounted]);

  const Title = (
    <h1 className="text-xl font-bold tracking-tight text-violet-300">
      System Stats
    </h1>
  );

  const RefreshButton = (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => fetchData()} 
      disabled={loading}
      className="w-full md:w-auto glass-btn-blended bg-zinc-900/40 hover:bg-zinc-800/40 text-muted-foreground hover:text-foreground transition-all duration-300 shadow-sm font-medium rounded-lg cursor-pointer"
    >
      <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
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
          <h2 className="text-xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={() => fetchData()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardTemplate
      title={Title}
      refreshButton={RefreshButton}
      overview={<MetricsOverview latest={latest} />}
      charts={<HistorySection history={history} />}
      table={<DataTable data={history} />}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      deviceName={latest?.device_name}
    />
  );
}
