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
from app.infrastructure.system.backup_manager import BackupManager
from datetime import datetime

# Initialize DB tables with self-healing schema validation
try:
    if settings.DATABASE_URL.startswith("sqlite:///"):
        db_path = settings.DATABASE_URL.replace("sqlite:///", "")
        if os.path.exists(db_path):
            from sqlalchemy import inspect
            inspector = inspect(engine)
            if inspector.has_table("system_metrics"):
                columns = [c["name"] for c in inspector.get_columns("system_metrics")]
                if "disk_sata_usage_gb" not in columns or "disk_services_json" not in columns or "cpu_name" not in columns or "ram_services_json" not in columns:
                    print("Schema mismatch: columns missing. Re-creating SQLite database...")
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
        await asyncio.to_thread(use_cases.collect_and_save)
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
            await asyncio.to_thread(use_cases.collect_and_save)
            db.close()
        except asyncio.CancelledError:
            print("Cron worker background task cancelled.")
            break
        except Exception as e:
            print(f"Error during scheduled metrics capture: {e}")

async def backup_worker():
    # Wait a few seconds after startup to avoid concurrency conflicts with initial metrics capture
    await asyncio.sleep(15)
    print("Background backup worker started. Checking backups status every hour.")
    
    while True:
        try:
            db = SessionLocal()
            manager = BackupManager(db)
            status = manager.get_latest_backups_status()
            
            # Check backups status for each service
            for service in ["minecraft", "outline", "nextcloud"]:
                latest = status[service]["latest_backup"]
                needs_backup = False
                
                if latest is None:
                    print(f"No physical backup found for {service}. Triggering initial backup...")
                    needs_backup = True
                else:
                    # Parse backup date and calculate elapsed time
                    latest_date = datetime.fromisoformat(latest["date"])
                    diff_seconds = (datetime.utcnow() - latest_date).total_seconds()
                    # 7 days = 604800 seconds
                    if diff_seconds >= 604800:
                        print(f"Latest backup for {service} is {diff_seconds / 3600:.1f} hours old. Triggering scheduled backup...")
                        needs_backup = True
                
                if needs_backup:
                    # Run backup inside a separate worker thread to avoid blocking the event loop
                    await asyncio.to_thread(manager.run_backup, service)
            
            db.close()
        except Exception as e:
            print(f"Error inside background backup worker: {e}")
            
        try:
            # Check backups once every hour (3600 seconds)
            await asyncio.sleep(3600)
        except asyncio.CancelledError:
            print("Backup worker background task cancelled.")
            break

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: launch background worker tasks
    task_cron = asyncio.create_task(cron_worker())
    background_tasks.add(task_cron)
    task_cron.add_done_callback(background_tasks.discard)

    task_backup = asyncio.create_task(backup_worker())
    background_tasks.add(task_backup)
    task_backup.add_done_callback(background_tasks.discard)
    yield
    # Shutdown: cancel background worker tasks
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
