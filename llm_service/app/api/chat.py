from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.memory_service import generate_chat_response
from app.services.auth_client import get_auth_client
import logging

router = APIRouter()
logger = logging.getLogger(__name__)
auth_client = get_auth_client()




@router.post("/respond", response_model=ChatResponse)
async def respond_to_user(payload: ChatRequest):
    try:
        # Validate input
        if not payload.message or not payload.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        if not payload.user_id or not payload.user_id.strip():
            raise HTTPException(status_code=400, detail="User ID cannot be empty")
        
        # Generate AI response first
        ai_response = await generate_chat_response(payload)
        
        # Handle conversation persistence if auth token is provided
        conversation_id = payload.conversation_id
        
        if payload.auth_token:
            try:
                # Create new conversation if no conversation_id provided
                if not conversation_id:
                    # Create conversation with the user's first message as title
                    title = payload.message[:50] + ("..." if len(payload.message) > 50 else "")
                    conversation_id = await auth_client.create_conversation(
                        user_id=payload.user_id,
                        title=title,
                        auth_token=payload.auth_token
                    )
                    
                    if conversation_id:
                        logger.info(f"Created new conversation: {conversation_id}")
                    else:
                        logger.warning("Failed to create conversation, proceeding without persistence")
                
                # Save both user message and AI response if we have a conversation
                if conversation_id:
                    # Save user message
                    user_saved = await auth_client.add_message_to_conversation(
                        conversation_id=conversation_id,
                        role="user",
                        content=payload.message,
                        auth_token=payload.auth_token
                    )
                    
                    # Save AI response
                    ai_saved = await auth_client.add_message_to_conversation(
                        conversation_id=conversation_id,
                        role="assistant",
                        content=ai_response,
                        auth_token=payload.auth_token
                    )
                    
                    if user_saved and ai_saved:
                        logger.info(f"Successfully saved messages to conversation: {conversation_id}")
                    else:
                        logger.warning(f"Failed to save some messages to conversation: {conversation_id}")
                        
            except Exception as e:
                logger.error(f"Error handling conversation persistence: {str(e)}")
                # Continue without failing the whole request
        
        return ChatResponse(response=ai_response, conversation_id=conversation_id)
    
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