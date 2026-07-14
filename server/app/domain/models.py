from datetime import datetime
from typing import Optional

class SystemMetricDomain:
    def __init__(
        self,
        id: Optional[int] = None,
        timestamp: Optional[datetime] = None,
        device_name: str = "host-machine",
        cpu_temp: float = 0.0,
        cpu_usage: float = 0.0,
        disk_temp: float = 0.0,
        disk_usage_gb: float = 0.0,
        disk_total_gb: float = 0.0,
        ram_usage_mb: float = 0.0,
        ram_total_mb: float = 0.0,
        ram_usage_percent: float = 0.0,
        net_rx_mb: float = 0.0,
        net_tx_mb: float = 0.0,
        uptime: str = "unknown",
        power_usage_w: float = 0.0
    ):
        self.id = id
        self.timestamp = timestamp or datetime.utcnow()
        self.device_name = device_name
        self.cpu_temp = cpu_temp
        self.cpu_usage = cpu_usage
        self.disk_temp = disk_temp
        self.disk_usage_gb = disk_usage_gb
        self.disk_total_gb = disk_total_gb
        self.ram_usage_mb = ram_usage_mb
        self.ram_total_mb = ram_total_mb
        self.ram_usage_percent = ram_usage_percent
        self.net_rx_mb = net_rx_mb
        self.net_tx_mb = net_tx_mb
        self.uptime = uptime
        self.power_usage_w = power_usage_w
