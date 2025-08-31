"""
Mock embedding service for testing purposes.
This provides fake embeddings when external APIs are not available.
"""

import logging
from typing import List
import random

logger = logging.getLogger(__name__)

async def embed_text(text: str) -> List[float]:
    """
    Generates a mock vector embedding for the given text.
    
    Args:
        text (str): The input text to generate embeddings for.
        
    Returns:
        List[float]: A mock embedding vector of 384 dimensions.
        
    Raises:
        ValueError: If the input text is empty.
    """
    if not text or not text.strip():
        raise ValueError("Input text cannot be empty.")

    # Generate a consistent mock embedding based on text hash
    # This ensures the same text always gets the same embedding
    text_hash = hash(text.strip()) % (2**31)
    random.seed(text_hash)
    
    # Generate 384-dimensional vector (same as all-MiniLM-L6-v2)
    embedding = [random.uniform(-1, 1) for _ in range(384)]
    
    logger.info(f"Generated mock embedding for text of length {len(text)}")
    return embedding

async def embed_texts_batch(texts: List[str]) -> List[List[float]]:
    """
    Generates mock vector embeddings for multiple texts.
    """
    if not texts:
        raise ValueError("Input texts list cannot be empty.")
    
    embeddings = []
    for text in texts:
        embedding = await embed_text(text)
        embeddings.append(embedding)
    
    logger.info(f"Generated mock embeddings for {len(texts)} texts")
    return embeddings

def get_embedding_dimension() -> int:
    """Returns the dimension of mock embeddings."""
    return 384

def get_model_info() -> dict:
    """Returns mock model information."""
    return {
        "repo_id": "mock/embedding-model",
        "dimension": 384,
        "provider": "Mock",
        "model_type": "mock-transformer"
    }

async def validate_embedding_service() -> bool:
    """Validates that the mock embedding service works."""
    try:
        test_text = "This is a test message."
        embedding = await embed_text(test_text)
        
        if embedding and len(embedding) == 384:
            logger.info("Mock embedding service validation successful")
            return True
        else:
            logger.error("Mock embedding service validation failed")
            return False
            
    except Exception as e:
        logger.error(f"Mock embedding service validation failed: {e}")
        return False