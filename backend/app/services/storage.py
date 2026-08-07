"""MinIO / S3-compatible storage service."""
import io
import uuid
from datetime import timedelta
from minio import Minio
from minio.error import S3Error
from fastapi import UploadFile

from app.core.config import settings


class StorageService:
    def __init__(self):
        self.client = Minio(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE,
        )
        self._ensure_bucket()

    def _ensure_bucket(self):
        try:
            if not self.client.bucket_exists(settings.MINIO_BUCKET):
                self.client.make_bucket(settings.MINIO_BUCKET)
        except S3Error:
            pass  # Already exists or no connection yet

    def upload_file(self, file: UploadFile, user_id: str) -> dict:
        """Upload a file and return storage metadata."""
        ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else "bin"
        object_name = f"{user_id}/{uuid.uuid4()}.{ext}"
        data = file.file.read()
        size = len(data)

        self.client.put_object(
            bucket_name=settings.MINIO_BUCKET,
            object_name=object_name,
            data=io.BytesIO(data),
            length=size,
            content_type=file.content_type or "application/octet-stream",
        )
        return {"storage_path": object_name, "file_size": size, "file_type": ext}

    def get_presigned_url(self, object_name: str, expires_minutes: int = 60) -> str:
        """Generate a pre-signed download URL."""
        return self.client.presigned_get_object(
            settings.MINIO_BUCKET,
            object_name,
            expires=timedelta(minutes=expires_minutes),
        )

    def delete_file(self, object_name: str):
        self.client.remove_object(settings.MINIO_BUCKET, object_name)

    def get_file_bytes(self, object_name: str) -> bytes:
        response = self.client.get_object(settings.MINIO_BUCKET, object_name)
        return response.read()


storage_service = StorageService()
