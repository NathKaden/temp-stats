from sqlalchemy.orm import Session
from typing import List, Optional
from app.infrastructure.db.models import BackupLog
from app.domain.models import BackupLogDomain

class BackupLogsRepository:
    def __init__(self, db: Session):
        self.db = db

    def add(self, log: BackupLogDomain) -> BackupLog:
        db_log = BackupLog(
            service=log.service,
            timestamp=log.timestamp,
            status=log.status,
            size_bytes=log.size_bytes,
            files_json=log.files_json,
            error_message=log.error_message
        )
        self.db.add(db_log)
        self.db.commit()
        self.db.refresh(db_log)
        return db_log

    def update(self, log_id: int, status: str, size_bytes: int = 0, files_json: Optional[str] = None, error_message: Optional[str] = None) -> Optional[BackupLog]:
        db_log = self.db.query(BackupLog).filter(BackupLog.id == log_id).first()
        if db_log:
            db_log.status = status
            db_log.size_bytes = size_bytes
            if files_json is not None:
                db_log.files_json = files_json
            if error_message is not None:
                db_log.error_message = error_message
            self.db.commit()
            self.db.refresh(db_log)
        return db_log

    def get_latest_for_service(self, service: str) -> Optional[BackupLog]:
        return self.db.query(BackupLog).filter(BackupLog.service == service).order_by(BackupLog.timestamp.desc()).first()

    def get_all(self, limit: int = 50) -> List[BackupLog]:
        return self.db.query(BackupLog).order_by(BackupLog.timestamp.desc()).limit(limit).all()
