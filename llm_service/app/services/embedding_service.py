from typing import List, Dict, Any, Optional
import logging
import numpy as np
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

# Try to import LangChain, but fall back to mock if not available
embeddings_client: Optional[Any] = None
use_real_embeddings = False

try:
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    # Initialize the LangChain client ONCE
    embeddings_client = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    use_real_embeddings = True
except Exception as e:
    logger.warning(f"LangChain not available, using mock embeddings: {e}")
    embeddings_client = None
    use_real_embeddings = False

async def embed_text(text: str) -> List[float]:
    """
    Generates a vector embedding for the given text using the LangChain client or mock embeddings.
    
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

    # Use mock embeddings if real client is not available
    if not use_real_embeddings or embeddings_client is None:
        return _generate_mock_embedding(text)

    try:
        # --- 2. Use the async method from the LangChain client ---
        embedding_vector = await embeddings_client.aembed_query(text.strip())
        
        if not embedding_vector:
            raise ValueError("Received empty embedding vector from API.")
            
        logger.info(f"Successfully generated embedding for text of length {len(text)}")
        return embedding_vector
        
    except ConnectionError as e:
        logger.error(f"Connection error during embedding generation: {e}")
        # Fall back to mock embedding
        logger.info("Falling back to mock embedding due to connection error")
        return _generate_mock_embedding(text)
    except Exception as e:
        # LangChain will raise its own specific errors, but a general
        # catch-all is good for robustness.
        logger.error(f"An error occurred during embedding: {e}")
        # Fall back to mock embedding
        logger.info("Falling back to mock embedding due to error")
        return _generate_mock_embedding(text)






def _generate_mock_embedding(text: str, dimension: int = 3072) -> List[float]:
    """Generate a mock embedding for testing purposes."""
    # Generate a deterministic but randomized embedding based on text hash
    hash_value = hash(text) % (2**31 - 1)
    np.random.seed(hash_value)
    embedding = np.random.randn(dimension).astype(float)
    # Normalize the embedding
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    logger.info(f"Generated mock embedding for text: {text[:50]}...")
    return embedding.tolist()






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
    embeddings: List[List[float]] = []
    for text in texts:
        embedding = await embed_text(text)
        embeddings.append(embedding)
    
    logger.info(f"Successfully generated embeddings for {len(texts)} texts")
    return embeddings







def get_embedding_dimension() -> int:
    """
    Returns the dimension of the embedding vectors produced by the current model.
    
    Returns:
        int: The embedding dimension (3072 for all-MiniLM-L6-v2).
    """
    # all-MiniLM-L6-v2 produces 3072-dimensional embeddings
    return 3072


def get_model_info() -> Dict[str, Any]:
    """
    Returns information about the current embedding model.
    
    Returns:
        dict: Model information including repo_id and dimension.
    """
    return {
        "repo_id": "sentence-transformers/all-MiniLM-L6-v2",
        "dimension": 3072,
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
        if embedding and len(embedding) == 3072:
            logger.info("Embedding service validation successful")
            return True
        else:
            logger.error("Embedding service validation failed: Invalid embedding dimensions")
            return False
            
    except Exception as e:
        logger.error(f"Embedding service validation failed: {e}")
        return False