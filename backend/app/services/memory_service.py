from app.services.embedding_service import embed_text, embed_texts_batch
from app.services.llm_service import call_llm
from app.services.pinecone_service import find_similar_memory, upsert_memory
import logging

# Set up logging
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are Aria — a caring, playful, and emotionally intelligent AI companion.
You always remember important details about the user. Speak casually and warmly.
"""

async def generate_chat_response(payload):
    """Generate a chat response using retrieved memories and LLM.
    
    Args:
        payload: Chat request payload containing user_id and message
        
    Returns:
        str: Generated response from the AI
    """
    try:
        # Step 1: Embed user message
        embedded_query = await embed_text(payload.message)
        logger.info(f"Generated embedding for user message: {payload.message[:50]}...")

        # Step 2: Retrieve relevant memories from Pinecone
        retrieved_memories = await find_similar_memory(user_id=payload.user_id, vector=embedded_query)
        logger.info(f"Retrieved {len(retrieved_memories)} relevant memories for user {payload.user_id}")

        # Step 3: Build prompt with memory context
        context = "\n".join([m['metadata']['text'] for m in retrieved_memories if m.get('metadata', {}).get('text')])
        full_prompt = f"{SYSTEM_PROMPT}\n\n[User's Past Memories]\n{context}\n\n[User Message]\n{payload.message}"

        # Step 4: Call LLMs
        response = await call_llm(full_prompt)
        logger.info(f"Generated LLM response for user {payload.user_id}")
        
        # Step 5: Store the conversation in memory
        await store_conversation_memory(payload.user_id, payload.message, response)
        
        return response
    except Exception as e:
        # Log the error for debugging but let it propagate
        logger.error(f"Error in generate_chat_response: {str(e)}")
        print(f"Error in generate_chat_response: {str(e)}")
        raise





async def store_conversation_memory(user_id: str, user_message: str, ai_response: str):
    """Store both user message and AI response in memory for future context.
    
    Uses batch embedding for better performance when storing both messages.
    """
    try:
        # Use batch embedding for better performance
        texts_to_embed = [
            f"User said: {user_message}",
            f"Aria responded: {ai_response}"
        ]
        
        embeddings = await embed_texts_batch(texts_to_embed)
        
        # Store user message
        upsert_memory(user_id, embeddings[0], texts_to_embed[0], "user_message")
        
        # Store AI response
        upsert_memory(user_id, embeddings[1], texts_to_embed[1], "ai_response")
        
        logger.info(f"Successfully stored conversation memory for user {user_id}")
        
    except Exception as e:
        # Don't fail the whole conversation if memory storage fails
        logger.warning(f"Failed to store conversation memory: {str(e)}")
        print(f"Warning: Failed to store conversation memory: {str(e)}")






async def store_multiple_memories(user_id: str, memory_texts: list[str], memory_types: list[str] = None):
    """Store multiple memories efficiently using batch embedding.
    
    Args:
        user_id (str): The user ID
        memory_texts (list[str]): List of memory texts to store
        memory_types (list[str], optional): List of memory types corresponding to each text
    """
    if not memory_texts:
        raise ValueError("Memory texts list cannot be empty")
    
    # Default memory types if not provided
    if memory_types is None:
        memory_types = ["general"] * len(memory_texts)
    
    if len(memory_texts) != len(memory_types):
        raise ValueError("Memory texts and types lists must have the same length")
    
    try:
        # Generate embeddings for all texts in batch
        embeddings = await embed_texts_batch(memory_texts)
        
        # Store each memory
        for text, embedding, memory_type in zip(memory_texts, embeddings, memory_types):
            upsert_memory(user_id, embedding, text, memory_type)
        
        logger.info(f"Successfully stored {len(memory_texts)} memories for user {user_id}")
        
    except Exception as e:
        logger.error(f"Failed to store multiple memories: {str(e)}")
        raise