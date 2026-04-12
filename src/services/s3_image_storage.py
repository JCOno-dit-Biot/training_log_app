from uuid import uuid4

import boto3


class S3ImageStorage:
    def __init__(
        self,
        *,
        bucket_name: str,
        region: str,
    ) -> None:
        self._bucket_name = bucket_name
        self._region = region
        self._client = boto3.client(
            "s3",
            region_name=region
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

    def get_presigned_url(self, storage_key: str, expires_in: int = 3600) -> str:
        return self._client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": self._bucket_name,
                "Key": storage_key,
            },
            ExpiresIn=expires_in,
        )

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