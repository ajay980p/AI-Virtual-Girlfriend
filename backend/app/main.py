from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat, memory, user
from app.config import get_settings

settings = get_settings()
router = APIRouter()

app = FastAPI(
    title="Project Aria – AI Virtual Girlfriend",
    version="0.1.0" 
)

# Add CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@router.get("/")
def test():
    return {"msg": "This is the root endpoint!"}

@router.get("/ping")
def ping():
    return {"status": "ok"}

@router.get("/health")
async def health():
    from app.services.auth_client import get_auth_client
    auth_client = get_auth_client()
    
    auth_service_healthy = await auth_client.health_check()
    
    return {
        "status": "ok",
        "services": {
            "auth_service": "healthy" if auth_service_healthy else "unhealthy"
        }
    }

# Register API routes
app.include_router(router, tags=["Test"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(memory.router, prefix="/memory", tags=["Memory"])
app.include_router(user.router, prefix="/user", tags=["User"])