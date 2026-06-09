import os
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, database
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pi Stats API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_KEY = os.getenv("API_KEY", "your-secret-key")

async def verify_api_key(x_api_key: str = Header(...)):
    if x_api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    return x_api_key

@app.post("/api/metrics", response_model=schemas.SystemMetric)
def create_metric(metric: schemas.SystemMetricCreate, db: Session = Depends(get_db), api_key: str = Depends(verify_api_key)):
    db_metric = models.SystemMetric(**metric.dict())
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric

@app.get("/api/metrics", response_model=List[schemas.SystemMetric])
def read_metrics(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    metrics = db.query(models.SystemMetric).order_by(models.SystemMetric.timestamp.desc()).offset(skip).limit(limit).all()
    return metrics

@app.get("/api/metrics/latest", response_model=schemas.SystemMetric)
def read_latest_metric(db: Session = Depends(get_db)):
    metric = db.query(models.SystemMetric).order_by(models.SystemMetric.timestamp.desc()).first()
    if metric is None:
        raise HTTPException(status_code=404, detail="No metrics found")
    return metric

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
