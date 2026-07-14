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
    ram_usage_mb: float
    ram_total_mb: float
    ram_usage_percent: float
    net_rx_mb: float
    net_tx_mb: float
    uptime: str
    power_usage_w: float

class SystemMetricCreate(SystemMetricBase):
    pass

class SystemMetric(SystemMetricBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
