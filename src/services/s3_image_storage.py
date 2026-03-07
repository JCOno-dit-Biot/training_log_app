from uuid import uuid4

import boto3


class S3ImageStorage:
    def __init__(
        self,
        *,
        bucket_name: str,
        region: str,
        public_base_url: str,
        aws_access_key_id: str,
        aws_secret_access_key: str,
    ) -> None:
        self._bucket_name = bucket_name
        self._region = region
        self._public_base_url = public_base_url.rstrip("/")
        self._client = boto3.client(
            "s3",
            region_name=region,
            aws_access_key_id=aws_access_key_id,
            aws_secret_access_key=aws_secret_access_key,
        )

    def upload_profile_image(
        self,
        *,
        owner_type: str,
        owner_id: int,
        content: bytes,
        content_type: str,
    ) -> str:
        extension = self._extension_from_content_type(content_type)
        key = f"profile-pictures/{owner_type}/{owner_id}/{uuid4().hex}.{extension}"

        self._client.put_object(
            Bucket=self._bucket_name,
            Key=key,
            Body=content,
            ContentType=content_type,
        )
        return key

    def get_public_url(self, storage_key: str) -> str:
        return f"{self._public_base_url}/{storage_key}"

    def delete(self, storage_key: str) -> None:
        self._client.delete_object(
            Bucket=self._bucket_name,
            Key=storage_key,
        )

    @staticmethod
    def _extension_from_content_type(content_type: str) -> str:
        mapping = {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
        }
        if content_type not in mapping:
            raise ValueError(f"Unsupported content type: {content_type}")
        return mapping[content_type]