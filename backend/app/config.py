"""
Configuration module for the backend API.
Handles environment variables and application settings.
"""

import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    """Application settings loaded from environment variabless."""
    
    # Server Configuration
    host: str = Field(default="localhost", alias="BACKEND_HOST")
    port: int = Field(default=8000, alias="BACKEND_PORT")
    debug: bool = Field(default=True, alias="DEBUG")
    
    # Auth Service Configuration
    auth_service_url: str = Field(default="http://localhost:3001", alias="AUTH_SERVICE_URL")
    auth_service_api_url: str = Field(default="http://localhost:3001/api", alias="AUTH_SERVICE_API_URL")
    
    # Pinecone Configuration
    pinecone_api_key: Optional[str] = Field(default=None, alias="PINECONE_API_KEY")
    pinecone_environment: Optional[str] = Field(default=None, alias="PINECONE_ENVIRONMENT")
    pinecone_index_name: str = Field(default="ai-girlfriend-memories", alias="PINECONE_INDEX_NAME")
    
    # LLM Configuration (OpenRouter)
    openrouter_api_key: Optional[str] = Field(default=None, alias="OPENROUTER_API_KEY")
    openrouter_api_url: str = Field(default="https://openrouter.ai/api/v1", alias="OPENROUTER_API_URL")
    
    # MongoDB Configuration
    mongodb_uri: str = Field(default="mongodb://localhost:27017/ai_girlfriend_dev", alias="MONGODB_URI")
    
    # CORS Configuration
    cors_origins: List[str] = Field(default=["http://localhost:3000", "http://localhost:3001"])
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Allow extra fields without validation errors

# Global settings instance
settings = Settings()

def get_settings() -> Settings:
    """Get application settings."""
    return settings