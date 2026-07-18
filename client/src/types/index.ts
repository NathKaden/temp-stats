export interface SystemMetric {
  id: number;
  timestamp: string;
  device_name: string;
  cpu_temp: number;
  cpu_usage: number;
  disk_temp: number;
  disk_usage_gb: number;
  disk_total_gb: number;
  disk_sata_usage_gb: number;
  disk_sata_total_gb: number;
  ram_usage_mb: number;
  ram_total_mb: number;
  ram_usage_percent: number;
  net_rx_mb: number;
  net_tx_mb: number;
  uptime: string;
  power_usage_w: number;
  disk_services_json?: string;
}
