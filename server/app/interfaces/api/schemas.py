from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SystemMetricBase(BaseModel):
    device_name: Optional[str] = "default"
    cpu_temp: float
    cpu_usage: float
    disk_temp: float
    disk_usage_gb: float
    disk_total_gb: float
    disk_sata_usage_gb: Optional[float] = 0.0
    disk_sata_total_gb: Optional[float] = 0.0
    ram_usage_mb: float
    ram_total_mb: float
    ram_usage_percent: float
    net_rx_mb: float
    net_tx_mb: float
    uptime: str
    power_usage_w: Optional[float] = 0.0
    disk_services_json: Optional[str] = None
    cpu_name: Optional[str] = None
    ram_services_json: Optional[str] = None

class SystemMetricCreate(SystemMetricBase):
    pass

class SystemMetric(SystemMetricBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
