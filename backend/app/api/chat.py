from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.memory_service import generate_chat_response
import logging

router = APIRouter()
logger = logging.getLogger(__name__)




@router.post("/respond", response_model=ChatResponse)
async def respond_to_user(payload: ChatRequest):
    try:
        # Validate input
        if not payload.message or not payload.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if not payload.user_id or not payload.user_id.strip():
            raise HTTPException(status_code=400, detail="User ID cannot be empty")
        
        response = await generate_chat_response(payload)
        return ChatResponse(response=response)
    
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    
    except ValueError as e:
        logger.error(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid input: {str(e)}")
    
    except ConnectionError as e:
        logger.error(f"Connection error: {str(e)}")
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
    
    except Exception as e:
        logger.error(f"Unexpected error in chat response: {str(e)}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred")