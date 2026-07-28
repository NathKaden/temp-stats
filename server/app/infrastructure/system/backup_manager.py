import os
import time
import subprocess
import json
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.infrastructure.db.backup_repository import BackupLogsRepository
from app.domain.models import BackupLogDomain

class BackupManager:
    _active_backups = set()

    def __init__(self, db: Session, backup_root: str = "/mnt/backup"):
        self.db = db
        self.backup_root = backup_root
        self.repo = BackupLogsRepository(db)

    def get_backup_history(self) -> List[Dict[str, Any]]:
        """Returns a list of all backup logs from the database."""
        logs = self.repo.get_all(limit=50)
        result = []
        for log in logs:
            result.append({
                "id": log.id,
                "service": log.service,
                "timestamp": log.timestamp.isoformat() if log.timestamp else None,
                "status": log.status,
                "size_bytes": log.size_bytes,
                "files": json.loads(log.files_json) if log.files_json else [],
                "error_message": log.error_message
            })
        return result

    def get_latest_backups_status(self) -> Dict[str, Any]:
        """Scans the backup directory physically and returns metadata for each service."""
        services = ["minecraft", "outline", "nextcloud"]
        status = {}

        for service in services:
            latest_db_log = self.repo.get_latest_for_service(service)
            service_dir = os.path.join(self.backup_root, service)
            
            # Find physically existing backups on disk
            physical_backups = []
            if os.path.exists(service_dir):
                for name in os.listdir(service_dir):
                    dir_path = os.path.join(service_dir, name)
                    if os.path.isdir(dir_path):
                        # Calculate folder size and list files
                        size = 0
                        files = []
                        for f in os.listdir(dir_path):
                            fp = os.path.join(dir_path, f)
                            if os.path.isfile(fp):
                                size += os.path.getsize(fp)
                                files.append(f)
                        
                        try:
                            # Parse directory name (format: YYYYMMDD_HHMMSS)
                            dt = datetime.strptime(name, "%Y%m%d_%H%M%S")
                            physical_backups.append({
                                "folder": name,
                                "date": dt.isoformat(),
                                "size_bytes": size,
                                "files": files
                            })
                        except ValueError:
                            continue

            # Sort physical backups by date descending
            physical_backups.sort(key=lambda x: x["folder"], reverse=True)

            status[service] = {
                "latest_backup": physical_backups[0] if physical_backups else None,
                "total_backups_count": len(physical_backups),
                "db_status": {
                    "status": latest_db_log.status if latest_db_log else "unknown",
                    "timestamp": latest_db_log.timestamp.isoformat() if latest_db_log and latest_db_log.timestamp else None,
                    "error_message": latest_db_log.error_message if latest_db_log else None
                } if latest_db_log else None
            }

        return status

    def run_backup(self, service: str) -> Dict[str, Any]:
        """Runs the backup for a specific service and logs the status in the DB."""
        if service not in ["minecraft", "outline", "nextcloud"]:
            return {"status": "failed", "error": f"Unknown service: {service}"}

        # Prevent concurrent duplicate executions of the same service backup
        if service in self._active_backups:
            print(f"Backup for {service} is already running. Skipping duplicate run.")
            return {"status": "skipped", "message": f"Backup for {service} is already running."}

        self._active_backups.add(service)

        # 1. Create a DB log entry with status 'running'
        log_domain = BackupLogDomain(
            service=service,
            status="running",
            timestamp=datetime.utcnow()
        )
        db_log = self.repo.add(log_domain)
        log_id = db_log.id

        # Create timestamp and target folder path
        timestamp_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        target_dir = os.path.join(self.backup_root, service, timestamp_str)

        try:
            os.makedirs(target_dir, exist_ok=True)
            
            # 2. Execute backup commands
            if service == "outline":
                self._backup_outline(target_dir, timestamp_str)
            elif service == "nextcloud":
                self._backup_nextcloud(target_dir, timestamp_str)
            elif service == "minecraft":
                self._backup_minecraft(target_dir, timestamp_str)

            # 3. Calculate size and files list
            size_bytes = 0
            files = []
            for f in os.listdir(target_dir):
                fp = os.path.join(target_dir, f)
                if os.path.isfile(fp):
                    size_bytes += os.path.getsize(fp)
                    files.append(f)

            # 4. Clean up older backups (keep last 30 days)
            self._cleanup_old_backups(service)

            # 5. Update DB log to 'success'
            self.repo.update(
                log_id=log_id,
                status="success",
                size_bytes=size_bytes,
                files_json=json.dumps(files)
            )

            return {
                "status": "success",
                "service": service,
                "timestamp": timestamp_str,
                "size_bytes": size_bytes,
                "files": files
            }

        except Exception as e:
            error_msg = str(e)
            print(f"Error during backup of {service}: {error_msg}")
            
            # Update DB log to 'failed'
            self.repo.update(
                log_id=log_id,
                status="failed",
                error_message=error_msg
            )
            
            # Clean up target directory if empty or failed
            try:
                if os.path.exists(target_dir) and not os.listdir(target_dir):
                    os.rmdir(target_dir)
            except:
                pass

            return {"status": "failed", "service": service, "error": error_msg}

        finally:
            self._active_backups.discard(service)

    def _backup_outline(self, target_dir: str, date_str: str):
        # 1. Database dump
        db_file = os.path.join(target_dir, f"outline_db_{date_str}.sql")
        with open(db_file, "w") as f:
            # We redirect standard output of the docker exec pg_dump command to the sql file
            res = subprocess.run(
                ["docker", "exec", "outline-postgres-1", "pg_dump", "-U", "postgres", "outline"],
                stdout=f,
                stderr=subprocess.PIPE,
                text=True
            )
            if res.returncode != 0:
                raise Exception(f"PostgreSQL pg_dump failed: {res.stderr}")

        # 2. Config files backup
        config_tar = os.path.join(target_dir, f"outline_config_{date_str}.tar.gz")
        res = subprocess.run([
            "tar", "--exclude=./data", "-czf", config_tar, "-C", "/opt/outline", "."
        ], capture_output=True, text=True)
        if res.returncode != 0:
            raise Exception(f"Outline config compression failed: {res.stderr}")

        # 3. Storage volume backup
        volume_tar = os.path.join(target_dir, f"outline_volume_storage_{date_str}.tar.gz")
        res = subprocess.run([
            "docker", "run", "--rm",
            "-v", "outline_storage-data:/volume",
            "-v", f"{target_dir}:/backup",
            "alpine", "tar", "-czf", f"/backup/outline_volume_storage_{date_str}.tar.gz", "-C", "/volume", "."
        ], capture_output=True, text=True)
        if res.returncode != 0:
            raise Exception(f"Outline volume backup container failed: {res.stderr}")

    def _backup_nextcloud(self, target_dir: str, date_str: str):
        # 1. Database dump
        db_file = os.path.join(target_dir, f"nextcloud_db_{date_str}.sql")
        with open(db_file, "w") as f:
            res = subprocess.run([
                "docker", "exec", "nextcloud-db", "mysqldump", "-u", "nucnath", "-pfripouille", "nextcloud"
            ], stdout=f, stderr=subprocess.PIPE, text=True)
            if res.returncode != 0:
                raise Exception(f"MariaDB mysqldump failed: {res.stderr}")

        # 2. Config & Data files backup (excluding only the database mount to avoid active locks)
        # We use a plain tar archive (no gzip compression) to process 60GB of media files quickly without CPU overhead.
        config_tar = os.path.join(target_dir, f"nextcloud_config_{date_str}.tar")
        res = subprocess.run([
            "tar", "--exclude=./db",
            "-cf", config_tar, "-C", "/opt/nextcloud", "."
        ], capture_output=True, text=True)
        if res.returncode != 0:
            raise Exception(f"Nextcloud config compression failed: {res.stderr}")

    def _backup_minecraft(self, target_dir: str, date_str: str):
        # 1. Tell Minecraft to save-off and save-all (best effort, ignored if offline)
        subprocess.run(["docker", "exec", "minecraft-paper", "rcon-cli", "save-off"], capture_output=True, text=True)
        subprocess.run(["docker", "exec", "minecraft-paper", "rcon-cli", "save-all", "flush"], capture_output=True, text=True)

        try:
            # 2. Backup Minecraft data files
            data_tar = os.path.join(target_dir, f"minecraft_data_{date_str}.tar.gz")
            res = subprocess.run([
                "tar", "-czf", data_tar, "-C", "/opt/minecraft", "."
            ], capture_output=True, text=True)
            if res.returncode != 0:
                raise Exception(f"Minecraft data compression failed: {res.stderr}")
        finally:
            # 3. Tell Minecraft to save-on
            subprocess.run(["docker", "exec", "minecraft-paper", "rcon-cli", "save-on"], capture_output=True, text=True)

    def _cleanup_old_backups(self, service: str):
        """Finds backup folders older than 30 days for this service and deletes them."""
        service_dir = os.path.join(self.backup_root, service)
        if not os.path.exists(service_dir):
            return

        now = time.time()
        thirty_days_seconds = 30 * 24 * 60 * 60

        for name in os.listdir(service_dir):
            dir_path = os.path.join(service_dir, name)
            if os.path.isdir(dir_path):
                try:
                    # Parse timestamp format YYYYMMDD_HHMMSS
                    dt = datetime.strptime(name, "%Y%m%d_%H%M%S")
                    folder_timestamp = dt.timestamp()
                    if (now - folder_timestamp) > thirty_days_seconds:
                        print(f"Cleaning up old backup: {dir_path}")
                        # Recursively delete files and folder
                        for root, dirs, files in os.walk(dir_path, topdown=False):
                            for file in files:
                                os.remove(os.path.join(root, file))
                            for d in dirs:
                                os.rmdir(os.path.join(root, d))
                        os.rmdir(dir_path)
                except ValueError:
                    # Ignore folders that don't match the timestamp format
                    continue
