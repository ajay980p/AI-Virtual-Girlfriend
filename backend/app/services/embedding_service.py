import os
import logging
from typing import List, Optional
from dotenv import load_dotenv
# Correct import for calling the Hugging Face API endpoint
from langchain_huggingface import HuggingFaceEndpointEmbeddings

# Load environment variables from .env file
load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

# --- 1. Initialize the LangChain client ONCE ---
embeddings_client = HuggingFaceEndpointEmbeddings(
    repo_id="sentence-transformers/all-MiniLM-L6-v2",
    huggingfacehub_api_token=os.getenv("HUGGINGFACEHUB_API_TOKEN"),
)

async def embed_text(text: str) -> List[float]:
    """
    Generates a vector embedding for the given text using the LangChain client.
    
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

    try:
        # --- 2. Use the async method from the LangChain client ---
        embedding_vector = await embeddings_client.aembed_query(text.strip())
        
        if not embedding_vector:
            raise ValueError("Received empty embedding vector from API.")
            
        logger.info(f"Successfully generated embedding for text of length {len(text)}")
        return embedding_vector
        
    except ConnectionError as e:
        logger.error(f"Connection error during embedding generation: {e}")
        raise ConnectionError(f"Failed to connect to HuggingFace API: {str(e)}")
    except Exception as e:
        # LangChain will raise its own specific errors, but a general
        # catch-all is good for robustness.
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
    
    try:
        # Strip whitespace from all texts
        cleaned_texts = [text.strip() for text in texts]
        
        # --- Use the batch embedding method ---
        embedding_vectors = await embeddings_client.aembed_documents(cleaned_texts)
        
        if not embedding_vectors or len(embedding_vectors) != len(texts):
            raise ValueError("Received invalid batch embedding response from API.")
            
        logger.info(f"Successfully generated embeddings for {len(texts)} texts")
        return embedding_vectors
        
    except ConnectionError as e:
        logger.error(f"Connection error during batch embedding generation: {e}")
        raise ConnectionError(f"Failed to connect to HuggingFace API: {str(e)}")
    except Exception as e:
        logger.error(f"An error occurred during batch embedding: {e}")
        raise ValueError(f"Failed to generate batch embeddings: {str(e)}")







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