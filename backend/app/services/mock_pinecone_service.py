"""
Mock Pinecone service for testing purposes.
This provides in-memory storage instead of connecting to Pinecone.
"""

import logging
from typing import Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# In-memory storage for testing
memory_store = {}

async def find_similar_memory(user_id: str, vector: list[float], top_k: int = 5) -> list[dict]:
    """
    Find similar memories for a given user using mock in-memory storage.
    
    Args:
        user_id (str): The ID of the user whose memories to search within.
        vector (list[float]): The embedding vector (not used in mock)
        top_k (int): Number of similar memories to return.
        
    Returns:
        list[dict]: List of mock memory matches with metadata.
    """
    logger.info(f"Mock: Finding similar memories for user {user_id}")
    
    # Get memories for this user
    user_memories = memory_store.get(user_id, [])
    
    # Return up to top_k memories (newest first)
    recent_memories = sorted(user_memories, key=lambda x: x['metadata']['timestamp'], reverse=True)[:top_k]
    
    logger.info(f"Mock: Found {len(recent_memories)} memories for user {user_id}")
    return recent_memories

def find_similar_memory_id(user_id: str, vector: list[float], threshold: float = 0.9) -> Optional[str]:
    """
    Find similar memory ID using mock storage.
    
    Returns:
        None: Always returns None for mock (no deduplication)
    """
    logger.info(f"Mock: Checking for similar memory for user {user_id}")
    return None

def upsert_memory(user_id: str, vector: list[float], text: str, memory_type: str = "conversation") -> None:
    """
    Insert memory into mock in-memory storage.
    
    Args:
        user_id (str): The ID of the user
        vector (list[float]): The embedding vector (stored but not used)
        text (str): The memory text
        memory_type (str): The type of memory
    """
    logger.info(f"Mock: Storing memory for user {user_id}: {text[:50]}...")
    
    # Initialize user memory list if not exists
    if user_id not in memory_store:
        memory_store[user_id] = []
    
    # Create memory entry
    memory_entry = {
        'id': f"mock_{user_id}_{len(memory_store[user_id])}",
        'score': 0.95,  # Mock similarity score
        'metadata': {
            'user_id': user_id,
            'text': text,
            'type': memory_type,
            'timestamp': datetime.utcnow().isoformat()
        }
    }
    
    # Store the memory
    memory_store[user_id].append(memory_entry)
    
    # Keep only last 10 memories per user to prevent memory growth
    if len(memory_store[user_id]) > 10:
        memory_store[user_id] = memory_store[user_id][-10:]
    
    logger.info(f"Mock: Successfully stored memory for user {user_id}")

def get_memory_stats() -> dict:
    """Get statistics about stored memories."""
    total_memories = sum(len(memories) for memories in memory_store.values())
    return {
        'total_users': len(memory_store),
        'total_memories': total_memories,
        'users': list(memory_store.keys())
    }