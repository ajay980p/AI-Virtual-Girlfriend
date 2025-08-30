from fastapi import FastAPI, APIRouter
from app.api import chat, memory, user

router = APIRouter()

app = FastAPI(
    title="Project Aria – AI Virtual Girlfriend",
    version="0.1.0" 
)

@router.get("/ping")
def test():
    return {"msg": "pong"}

# Register API routes
app.include_router(router, tags=["Test"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(memory.router, prefix="/memory", tags=["Memory"])
app.include_router(user.router, prefix="/user", tags=["User"])