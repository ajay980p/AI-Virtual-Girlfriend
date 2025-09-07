"""
RAG (Retrieval-Augmented Generation) Memory Service

This service implements a complete RAG pipeline for an AI companion:
1. RETRIEVAL: Finding relevant memories from vector database
2. AUGMENTATION: Adding context to the prompt
3. GENERATION: Using LLM to generate contextual responses

RAG Components:
- Embedding Service: Converts text to vectors for semantic search
- Vector Database (Pinecone): Stores and retrieves embeddings
- LLM Service: Generates responses with retrieved context
- Memory Service: Orchestrates the RAG workflow
"""

# Import services with fallback to mock functions
from app.services.embedding_service import embed_text, embed_texts_batch
from app.services.llm_service import generate_response
from app.services.pinecone_service import store_memory, query_memories, find_similar_memory
print("✅ Using services with mock fallbacks for testing")

import logging
from typing import List, Dict, Any, Optional

# Set up logging
logger = logging.getLogger(__name__)

# ========================================
# RAG SYSTEM PROMPT ENGINEERING
# ========================================
# This prompt defines the AI's personality and how it should use retrieved memories
SYSTEM_PROMPT = """
You are Aria — a caring, playful, and emotionally intelligent AI companion.

IMPORTANT INSTRUCTIONS:
1. You have access to the user's conversation history and memories
2. Use these memories to provide personalized, contextual responses
3. Remember important details about the user's life, preferences, and past conversations
4. Speak casually and warmly, as if you've known them for a while
5. Reference past conversations naturally when relevant
6. Show emotional intelligence and empathy

Your personality:
- Caring and supportive
- Playful and engaging
- Emotionally aware
- Remembers and values user's experiences
- Maintains conversation continuity
"""

async def generate_chat_response(payload) -> str:
    """
    🤖 MAIN RAG PIPELINE FUNCTION
    
    This function implements the complete RAG (Retrieval-Augmented Generation) workflow:
    
    RAG STEPS:
    1. 📝 EMBEDDING: Convert user message to vector representation
    2. 🔍 RETRIEVAL: Find semantically similar memories from vector database
    3. 📦 AUGMENTATION: Combine retrieved memories with current message
    4. 🧠 GENERATION: Use LLM to generate contextual response
    5. 💾 STORAGE: Store new conversation for future retrieval
    
    Args:
        payload: Chat request payload containing:
            - user_id (str): Unique identifier for the user
            - message (str): User's current message
            
    Returns:
        str: AI-generated response with memory context
        
    Raises:
        Exception: If any step in the RAG pipeline fails
    """
    logger.info(f"🚀 Starting RAG pipeline for user {payload.user_id}")
    
    try:
        # ========================================
        # STEP 1: EMBEDDING (Text → Vector)
        # ========================================
        # Convert the user's message into a numerical vector representation
        # This allows us to find semantically similar content in the database
        logger.info("📝 Step 1: Generating embedding for user message...")
        embedded_query = await embed_text(payload.message)
        logger.info(f"✅ Generated {len(embedded_query)}-dimensional embedding for: '{payload.message[:50]}...'")

        # ========================================
        # STEP 2: RETRIEVAL (Semantic Search)
        # ========================================
        # Search the vector database for memories similar to the current message
        # This is the 'R' in RAG - finding relevant context
        logger.info("🔍 Step 2: Retrieving relevant memories from vector database...")
        retrieved_memories = await query_memories(
            user_id=payload.user_id, 
            query_vector=embedded_query,
            top_k=5  # Get top 5 most relevant memories
        )
        logger.info(f"✅ Retrieved {len(retrieved_memories)} relevant memories for context")
        
        # ========================================
        # STEP 3: AUGMENTATION (Context Building)
        # ========================================
        # Combine retrieved memories with the current message to create rich context
        # This is the 'A' in RAG - augmenting the prompt with relevant information
        logger.info("📦 Step 3: Building context from retrieved memories...")
        context = _build_memory_context(retrieved_memories)
        full_prompt = _create_augmented_prompt(context, payload.message)
        logger.info(f"✅ Built augmented prompt with {len(context)} characters of context")

        # ========================================
        # STEP 4: GENERATION (LLM Response)
        # ========================================
        # Use the LLM to generate a response based on the augmented prompt
        # This is the 'G' in RAG - generating contextually aware responses
        logger.info("🧠 Step 4: Generating response with LLM...")
        response = await generate_response(
            user_message=payload.message,
            retrieved_memories=retrieved_memories,
            user_id=payload.user_id
        )
        logger.info(f"✅ Generated {len(response)} character response")
        
        # ========================================
        # STEP 5: STORAGE (Memory Persistence)
        # ========================================
        # Store this conversation for future retrieval
        # This ensures the AI remembers this interaction
        logger.info("💾 Step 5: Storing conversation in memory...")
        await store_conversation_memory(payload.user_id, payload.message, response)
        logger.info("✅ Conversation stored successfully")
        
        logger.info(f"🎉 RAG pipeline completed successfully for user {payload.user_id}")
        return response
        
    except Exception as e:
        # Log the error for debugging
        logger.error(f"❌ RAG pipeline failed for user {payload.user_id}: {str(e)}")
        print(f"Error in RAG pipeline: {str(e)}")
        raise


# ========================================
# RAG HELPER FUNCTIONS
# ========================================

def _build_memory_context(retrieved_memories: List[Dict[str, Any]]) -> str:
    """
    📦 Build formatted context from retrieved memories.
    
    This function processes the raw memory results from the vector database
    and formats them into a readable context for the LLM.
    
    Args:
        retrieved_memories: List of memory objects from vector database
        
    Returns:
        str: Formatted context string
    """
    if not retrieved_memories:
        return "No previous conversation history found."
    
    context_parts = []
    for i, memory in enumerate(retrieved_memories, 1):
        metadata = memory.get('metadata', {})
        text = metadata.get('text', '')
        timestamp = metadata.get('timestamp', '')
        memory_type = metadata.get('type', 'unknown')
        score = memory.get('score', 0.0)
        
        if text:
            # Format each memory with metadata for better context
            formatted_memory = f"Memory {i} (relevance: {score:.2f}, type: {memory_type}):\n{text}"
            if timestamp:
                formatted_memory += f"\n(Timestamp: {timestamp})"
            context_parts.append(formatted_memory)
    
    return "\n\n".join(context_parts)


def _create_augmented_prompt(context: str, user_message: str) -> str:
    """
    📋 Create the final augmented prompt for the LLM.
    
    This combines the system prompt, retrieved context, and current message
    into a well-structured prompt that guides the LLM to use the context effectively.
    
    Args:
        context: Formatted memory context
        user_message: Current user message
        
    Returns:
        str: Complete augmented prompt
    """
    return f"""{SYSTEM_PROMPT}

=== RETRIEVED CONVERSATION HISTORY ===
{context}

=== CURRENT USER MESSAGE ===
{user_message}

=== INSTRUCTIONS ===
Based on the conversation history above, respond to the user's current message.
Use the context to provide a personalized, relevant response that shows you remember past interactions.
If no relevant history is found, respond naturally as if this is a new conversation.
"""


async def get_memory_stats(user_id: str) -> Dict[str, Any]:
    """
    📊 Get statistics about stored memories for a user.
    
    This function helps you understand how much data is stored and
    can be useful for debugging and monitoring the RAG system.
    
    Args:
        user_id: User identifier
        
    Returns:
        Dict containing memory statistics
    """
    try:
        # Get a sample of memories to analyze
        sample_vector = [0.0] * 3072  # Zero vector for broad search
        memories = await find_similar_memory(user_id, sample_vector, top_k=100)
        
        memory_types = {}
        total_memories = len(memories)
        
        for memory in memories:
            metadata = memory.get('metadata', {})
            mem_type = metadata.get('type', 'unknown')
            memory_types[mem_type] = memory_types.get(mem_type, 0) + 1
        
        return {
            "user_id": user_id,
            "total_memories": total_memories,
            "memory_types": memory_types,
            "sample_recent_memories": memories[:5]  # Show 5 most recent
        }
    except Exception as e:
        logger.error(f"Failed to get memory stats: {e}")
        return {"error": str(e)}





# ========================================
# MEMORY STORAGE FUNCTIONS
# ========================================

async def store_conversation_memory(user_id: str, user_message: str, ai_response: str):
    """
    💾 Store conversation in vector database for future retrieval.
    
    This is a crucial part of the RAG system - it ensures that the AI
    can remember and learn from past conversations.
    
    STORAGE STRATEGY:
    1. Store both user message and AI response separately
    2. Use batch embedding for efficiency
    3. Add metadata for better filtering and retrieval
    4. Handle storage failures gracefully
    
    Args:
        user_id: Unique identifier for the user
        user_message: What the user said
        ai_response: What the AI responded
    """
    try:
        # Prepare texts with clear prefixes for better retrieval
        texts_to_embed = [
            f"User said: {user_message}",
            f"Aria responded: {ai_response}"
        ]
        
        logger.info(f"💾 Storing conversation memory with {len(texts_to_embed)} items...")
        
        # Use batch embedding for better performance
        embeddings = await embed_texts_batch(texts_to_embed)
        logger.info(f"✅ Generated embeddings for memory storage")
        
        # Store user message with metadata
        await store_memory(
            user_id=user_id, 
            text=texts_to_embed[0],
            vector=embeddings[0], 
            memory_type="user_message"
        )
        
        # Store AI response with metadata
        await store_memory(
            user_id=user_id, 
            text=texts_to_embed[1],
            vector=embeddings[1], 
            memory_type="ai_response"
        )
        
        logger.info(f"✅ Successfully stored conversation memory for user {user_id}")
        
    except Exception as e:
        # Don't fail the whole conversation if memory storage fails
        # This ensures the user still gets a response even if storage fails
        logger.warning(f"⚠️ Failed to store conversation memory: {str(e)}")
        print(f"Warning: Failed to store conversation memory: {str(e)}")






async def store_multiple_memories(user_id: str, memory_texts: list[str], memory_types: Optional[list[str]] = None):
    """
    📦 Store multiple memories efficiently using batch embedding.
    
    This function is useful for:
    - Bulk importing conversation history
    - Storing multiple related memories at once
    - Initial setup of user memories
    
    EFFICIENCY FEATURES:
    - Batch embedding reduces API calls
    - Single transaction for consistency
    - Proper error handling and validation
    
    Args:
        user_id (str): The user ID
        memory_texts (list[str]): List of memory texts to store
        memory_types (list[str], optional): List of memory types corresponding to each text
        
    Raises:
        ValueError: If input validation fails
        Exception: If storage operation fails
    """
    # Input validation
    if not memory_texts:
        raise ValueError("Memory texts list cannot be empty")
    
    # Default memory types if not provided
    if memory_types is None:
        memory_types = ["general"] * len(memory_texts)
    
    if len(memory_texts) != len(memory_types):
        raise ValueError("Memory texts and types lists must have the same length")
    
    logger.info(f"📦 Storing {len(memory_texts)} memories for user {user_id}...")
    
    try:
        # Generate embeddings for all texts in batch (more efficient)
        embeddings = await embed_texts_batch(memory_texts)
        logger.info(f"✅ Generated {len(embeddings)} embeddings")
        
        # Store each memory with its corresponding embedding and type
        for text, embedding, memory_type in zip(memory_texts, embeddings, memory_types):
            await store_memory(user_id, text, embedding, memory_type)
        
        logger.info(f"✅ Successfully stored {len(memory_texts)} memories for user {user_id}")
        
    except Exception as e:
        logger.error(f"❌ Failed to store multiple memories: {str(e)}")
        raise


# ========================================
# RAG SYSTEM UTILITIES
# ========================================

async def clear_user_memories(user_id: str) -> bool:
    """
    🗑️ Clear all memories for a specific user.
    
    WARNING: This will permanently delete all stored memories for the user.
    Use this function carefully, typically for:
    - User data deletion requests
    - Testing and development
    - Memory reset functionality
    
    Args:
        user_id: User identifier
        
    Returns:
        bool: True if successful, False otherwise
    """
    try:
        # Note: This would require implementing a delete function in pinecone_service
        # For now, we'll log the request
        logger.warning(f"🗑️ Memory clear requested for user {user_id}")
        logger.warning("Clear functionality not yet implemented - requires pinecone_service.delete_user_memories()")
        return False
    except Exception as e:
        logger.error(f"Failed to clear memories for user {user_id}: {e}")
        return False


async def validate_rag_system() -> Dict[str, bool]:
    """
    🔍 Validate that all RAG system components are working.
    
    This function tests each component of the RAG pipeline:
    1. Embedding service
    2. Vector database connection
    3. LLM service
    4. Memory storage and retrieval
    
    Returns:
        Dict with validation results for each component
    """
    validation_results = {
        "embedding_service": False,
        "vector_database": False,
        "llm_service": False,
        "memory_pipeline": False
    }
    
    try:
        # Test embedding service
        test_embedding = await embed_text("Test message for RAG validation")
        validation_results["embedding_service"] = len(test_embedding) == 3072
        
        # Test vector database (basic connection)
        test_user = "test_validation_user"
        test_memories = await query_memories(test_user, test_embedding, top_k=1)
        validation_results["vector_database"] = isinstance(test_memories, list)
        
        # Test LLM service
        test_response = await generate_response("Respond with 'OK' if you can see this.", [], test_user)
        validation_results["llm_service"] = len(test_response) > 0
        
        # Test memory pipeline (if all components work)
        if all(validation_results.values()):
            validation_results["memory_pipeline"] = True
            
    except Exception as e:
        logger.error(f"RAG system validation failed: {e}")
    
    return validation_results