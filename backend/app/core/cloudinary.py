import cloudinary
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    CLOUDINARY_URL: str

    class Config:
        env_file = ".env"

settings = Settings()

cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)
