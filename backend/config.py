import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Use SQLite as default for immediate runability, easily switchable to PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./doctor_ai.db")
    # For PostgreSQL: "postgresql://user:password@localhost/doctor_ai"
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY", "your_api_key_here")
    NVIDIA_API_BASE: str = os.getenv("NVIDIA_API_BASE", "https://integrate.api.nvidia.com/v1")
    LLM_MODEL: str = os.getenv("LLM_MODEL", "nvidia/llama-3.3-nemotron-super-49b-v1.5")
    
    # SMTP Settings
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

settings = Settings()
