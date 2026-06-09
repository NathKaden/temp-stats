"use client";

import { useEffect, useState } from "react";
import { DashboardTemplate } from "@/components/templates/DashboardTemplate";
import { MetricsOverview } from "@/components/organisms/MetricsOverview";
import { HistorySection } from "@/components/organisms/HistorySection";
import { DataTable } from "@/components/molecules/DataTable";
import { metricsService } from "@/services/api";
import { SystemMetric } from "@/types";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [latest, setLatest] = useState<SystemMetric | null>(null);
  const [history, setHistory] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const Header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Pi Monitor</h1>
        <p className="text-sm text-muted-foreground">Raspberry Pi System Statistics</p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={fetchData} 
        disabled={loading}
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </div>
  );

  if (error && history.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-destructive">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button className="mt-4" onClick={fetchData}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <DashboardTemplate
      header={Header}
      overview={<MetricsOverview latest={latest} />}
      charts={<HistorySection history={history} />}
      table={<DataTable data={history} />}
    />
  );
}
