from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat, memory, user

router = APIRouter()

app = FastAPI(
    title="Project Aria – AI Virtual Girlfriend",
    version="0.1.0" 
)

# Add CORS middleware to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@router.get("/")
def test():
    return {"msg": "This is the root endpoint!"}

# Register API routes
app.include_router(router, tags=["Test"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(memory.router, prefix="/memory", tags=["Memory"])
app.include_router(user.router, prefix="/user", tags=["User"])