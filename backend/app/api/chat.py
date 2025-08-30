from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.memory_service import generate_chat_response

router = APIRouter()

@router.get("/ping")
def test():
    return {"msg": "pong"}

    

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    try:
        response = await generate_chat_response(payload)
        return ChatResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))