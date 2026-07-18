import sys
import os
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add the server directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.interfaces.api.routes import router as api_router
from app.use_cases.metrics import MetricsUseCases

# Initialize DB tables with self-healing schema validation
try:
    if settings.DATABASE_URL.startswith("sqlite:///"):
        db_path = settings.DATABASE_URL.replace("sqlite:///", "")
        if os.path.exists(db_path):
            from sqlalchemy import inspect
            inspector = inspect(engine)
            if inspector.has_table("system_metrics"):
                columns = [c["name"] for c in inspector.get_columns("system_metrics")]
                if "disk_sata_usage_gb" not in columns or "disk_services_json" not in columns or "cpu_name" not in columns:
                    print("Schema mismatch: 'cpu_name' column not found. Re-creating SQLite database...")
                    engine.dispose()
                    try:
                        os.remove(db_path)
                        print("Database file deleted successfully.")
                    except Exception as delete_error:
                        print(f"Could not delete database file: {delete_error}")
except Exception as e:
    print(f"Error during schema verification: {e}")

Base.metadata.create_all(bind=engine)

background_tasks = set()

async def cron_worker():
    # Initial collection on startup to ensure database has data immediately
    try:
        db = SessionLocal()
        use_cases = MetricsUseCases(db)
        print("Running initial startup system metrics capture...")
        use_cases.collect_and_save()
        db.close()
    except Exception as e:
        print(f"Error during initial metrics capture: {e}")
        
    print(f"Background worker started. Collecting metrics every {settings.COLLECTION_INTERVAL_SECONDS} seconds.")
    
    while True:
        try:
            await asyncio.sleep(settings.COLLECTION_INTERVAL_SECONDS)
            db = SessionLocal()
            use_cases = MetricsUseCases(db)
            print("Scheduled capture: collecting system metrics...")
            use_cases.collect_and_save()
            db.close()
        except asyncio.CancelledError:
            print("Cron worker background task cancelled.")
            break
        except Exception as e:
            print(f"Error during scheduled metrics capture: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: launch background worker task
    task = asyncio.create_task(cron_worker())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)
    yield
    # Shutdown: cancel background worker task
    for task in background_tasks:
        task.cancel()
    if background_tasks:
        await asyncio.gather(*background_tasks, return_exceptions=True)

app = FastAPI(title="System Monitor API", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
