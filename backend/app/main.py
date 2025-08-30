from fastapi import FastAPI
from app.api import chat, memory, user

app = FastAPI(
    title="Project Aria – AI Virtual Girlfriend",
    version="0.1.0"
)

# Register API routes
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(memory.router, prefix="/memory", tags=["Memory"])
app.include_router(user.router, prefix="/user", tags=["User"])