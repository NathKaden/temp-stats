from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from app.core.database import Base

class SystemMetric(Base):
    __tablename__ = "system_metrics"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    device_name = Column(String, default="default", index=True)
    cpu_temp = Column(Float)
    cpu_usage = Column(Float)
    disk_temp = Column(Float)
    disk_usage_gb = Column(Float)
    disk_total_gb = Column(Float)
    ram_usage_mb = Column(Float)
    ram_total_mb = Column(Float)
    ram_usage_percent = Column(Float)
    net_rx_mb = Column(Float)
    net_tx_mb = Column(Float)
    uptime = Column(String)
    power_usage_w = Column(Float, default=0.0)
