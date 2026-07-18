from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
import os
from app.core.database import get_db
from app.interfaces.api import schemas
from app.use_cases.metrics import MetricsUseCases
from app.domain.models import SystemMetricDomain

router = APIRouter()

API_KEY = os.getenv("API_KEY", "your-secret-key")

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    return x_api_key

# Manual metrics submission (useful for testing or backwards compatibility)
@router.post("/metrics", response_model=schemas.SystemMetric)
def create_metric(metric: schemas.SystemMetricCreate, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    use_cases = MetricsUseCases(db)
    metric_domain = SystemMetricDomain(
        device_name=metric.device_name,
        cpu_temp=metric.cpu_temp,
        cpu_usage=metric.cpu_usage,
        disk_temp=metric.disk_temp,
        disk_usage_gb=metric.disk_usage_gb,
        disk_total_gb=metric.disk_total_gb,
        ram_usage_mb=metric.ram_usage_mb,
        ram_total_mb=metric.ram_total_mb,
        ram_usage_percent=metric.ram_usage_percent,
        net_rx_mb=metric.net_rx_mb,
        net_tx_mb=metric.net_tx_mb,
        uptime=metric.uptime,
        power_usage_w=metric.power_usage_w
    )
    return use_cases.repository.add(metric_domain)

@router.get("/metrics", response_model=List[schemas.SystemMetric])
def read_metrics(limit: int = 100, db: Session = Depends(get_db)):
    use_cases = MetricsUseCases(db)
    return use_cases.get_history(limit)

@router.get("/metrics/latest", response_model=schemas.SystemMetric)
def read_latest_metric(db: Session = Depends(get_db)):
    try:
        from app.infrastructure.system.collector import SystemMetricsCollector
        metric = SystemMetricsCollector.collect()
        metric.id = 0  # Dummy ID to satisfy Pydantic schema validation
        return metric
    except Exception as e:
        # Fallback to DB if live collection fails
        use_cases = MetricsUseCases(db)
        metric = use_cases.get_latest()
        if metric is not None:
            return metric
        raise HTTPException(status_code=500, detail=f"Failed to collect live metrics: {str(e)}")

@router.post("/metrics/collect", response_model=schemas.SystemMetric)
def force_collect(db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    use_cases = MetricsUseCases(db)
    try:
        return use_cases.collect_and_save()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to collect metrics: {str(e)}")

@router.post("/metrics/reset")
def reset_metrics(db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    use_cases = MetricsUseCases(db)
    try:
        use_cases.clear_history()
        return {"status": "success", "message": "All metrics data has been cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear metrics: {str(e)}")

@router.get("/devices", response_model=List[str])
def read_devices(db: Session = Depends(get_db)):
    use_cases = MetricsUseCases(db)
    latest = use_cases.get_latest()
    if latest:
        return [latest.device_name]
    from app.infrastructure.system.collector import SystemMetricsCollector
    return [SystemMetricsCollector.get_hostname()]
