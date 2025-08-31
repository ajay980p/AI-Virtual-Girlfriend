import os
import logging
from typing import List
from dotenv import load_dotenv
import requests
import asyncio
import aiohttp

# Load environment variables from .env file
load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

# HuggingFace API configuration
HF_API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")  # Optional, for better rate limits

async def embed_text(text: str) -> List[float]:
    """
    Generates a vector embedding for the given text using HuggingFace API.
    
    Args:
        text (str): The input text to generate embeddings for.
        
    Returns:
        List[float]: The embedding vector as a list of floats.
        
    Raises:
        ValueError: If the input text is empty or embedding generation fails.
        ConnectionError: If there's an issue connecting to the HuggingFace API.
    """
    if not text or not text.strip():
        raise ValueError("Input text cannot be empty.")

    headers = {"Content-Type": "application/json"}
    if HF_API_KEY:
        headers["Authorization"] = f"Bearer {HF_API_KEY}"
    
    payload = {"inputs": text.strip()}
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(HF_API_URL, json=payload, headers=headers) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise ConnectionError(f"HuggingFace API error {response.status}: {error_text}")
                
                result = await response.json()
                
                # HuggingFace returns the embedding directly for feature extraction
                if isinstance(result, list) and len(result) > 0:
                    embedding_vector = result[0] if isinstance(result[0], list) else result
                    logger.info(f"Successfully generated embedding for text of length {len(text)}")
                    return embedding_vector
                else:
                    raise ValueError("Received invalid embedding response from HuggingFace API.")
                    
    except aiohttp.ClientError as e:
        logger.error(f"Connection error during embedding generation: {e}")
        raise ConnectionError(f"Failed to connect to HuggingFace API: {str(e)}")
    except Exception as e:
        logger.error(f"An error occurred during embedding: {e}")
        raise ValueError(f"Failed to generate embedding: {str(e)}")






async def embed_texts_batch(texts: List[str]) -> List[List[float]]:
    """
    Generates vector embeddings for multiple texts in batch.
    
    Args:
        texts (List[str]): List of input texts to generate embeddings for.
        
    Returns:
        List[List[float]]: List of embedding vectors, one for each input text.
        
    Raises:
        ValueError: If any input text is empty or embedding generation fails.
        ConnectionError: If there's an issue connecting to the HuggingFace API.
    """
    if not texts:
        raise ValueError("Input texts list cannot be empty.")
    
    # Validate all texts
    for i, text in enumerate(texts):
        if not text or not text.strip():
            raise ValueError(f"Text at index {i} cannot be empty.")
    
    # For now, process texts one by one (can be optimized later)
    embeddings = []
    for text in texts:
        embedding = await embed_text(text)
        embeddings.append(embedding)
    
    logger.info(f"Successfully generated embeddings for {len(texts)} texts")
    return embeddings







def get_embedding_dimension() -> int:
    """
    Returns the dimension of the embedding vectors produced by the current model.
    
    Returns:
        int: The embedding dimension (384 for all-MiniLM-L6-v2).
    """
    # all-MiniLM-L6-v2 produces 384-dimensional embeddings
    return 384


def get_model_info() -> dict:
    """
    Returns information about the current embedding model.
    
    Returns:
        dict: Model information including repo_id and dimension.
    """
    return {
        "repo_id": "sentence-transformers/all-MiniLM-L6-v2",
        "dimension": 384,
        "provider": "HuggingFace",
        "model_type": "sentence-transformer"
    }


async def validate_embedding_service() -> bool:
    """
    Validates that the embedding service is working correctly.
    
    Returns:
        bool: True if the service is working, False otherwise.
    """
    try:
        test_text = "This is a test message to validate the embedding service."
        embedding = await embed_text(test_text)
        
        # Check if we got a valid embedding
        if embedding and len(embedding) == 384:
            logger.info("Embedding service validation successful")
            return True
        else:
            logger.error("Embedding service validation failed: Invalid embedding dimensions")
            return False
            
    except Exception as e:
        logger.error(f"Embedding service validation failed: {e}")
        return False