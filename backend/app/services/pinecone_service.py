import os
from datetime import datetime
from typing import Optional
from pinecone import Pinecone
from dotenv import load_dotenv

load_dotenv()

# Load Pinecone configuration from .env 
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
INDEX_NAME = os.getenv("PINECONE_INDEX")

# Validate environment variables
if not PINECONE_API_KEY:
    raise ValueError("PINECONE_API_KEY is missing from environment variables")
if not INDEX_NAME:
    raise ValueError("PINECONE_INDEX is missing from environment variables")

print("Environment variables loaded successfully")
print(f"API Key: {PINECONE_API_KEY[:8]}...{PINECONE_API_KEY[-4:] if PINECONE_API_KEY else 'None'}")
print(f"Index Name: {INDEX_NAME}")

# Initialize Pinecone client with error handling (New API)
try:
    pc = Pinecone(api_key=PINECONE_API_KEY)
    index = pc.Index(INDEX_NAME)
    print("✅ Connected to Pinecone successfully!")
except Exception as e:
    print(f"❌ Failed to connect to Pinecone: {str(e)}")
    print("Common fixes:")
    print("1. Check your .env file exists in the backend/ directory")
    print("2. Verify your PINECONE_API_KEY is correct")
    print("3. Confirm INDEX_NAME exists in your Pinecone project")
    print("4. Make sure you're using the latest Pinecone client")
    raise


# 1. Find similar memory by cosine similarity
def find_similar_memory_id(user_id: str, vector: list[float], threshold: float = 0.9) -> Optional[str]:
    """Find the most similar memory vector ID for a given user using cosine similarity.

    Args:
        user_id (str): The ID of the user whose memories to search within.
        vector (list[float]): The embedding vector to compare against stored vectors.
        threshold (float, optional): Minimum similarity score (cosine) required 
            to consider it a match. Defaults to 0.9.

    Returns:
        Optional[str]: The ID of the most similar memory vector if the similarity
        score is above the threshold; otherwise None.
    """
    result = index.query(
        vector=vector,
        top_k=1,
        include_metadata=True,
        filter={"user_id": user_id}
    )
    matches = result.get("matches", [])
    if matches and matches[0]["score"] >= threshold:
        return matches[0]["id"]  # return vector ID
    return None






# 2. Find similar memories for chat context (async)
async def find_similar_memory(user_id: str, vector: list[float], top_k: int = 5) -> list[dict]:
    """Find similar memories for a given user to use as chat context.

    Args:
        user_id (str): The ID of the user whose memories to search within.
        vector (list[float]): The embedding vector to compare against stored vectors.
        top_k (int, optional): Number of similar memories to return. Defaults to 5.

    Returns:
        list[dict]: List of similar memory matches with metadata.
    """
    result = index.query(
        vector=vector,
        top_k=top_k,
        include_metadata=True,
        filter={"user_id": user_id}
    )
    return result.get("matches", [])







# 2. Upsert memory (create or update)
def upsert_memory(user_id: str, vector: list[float], text: str, memory_type: str = "conversation") -> None:
    """Insert or update a memory vector for a given user in the Pinecone index.

    This function checks if a similar memory already exists for the user (based on cosine similarity).
    - If a match above the threshold is found, it updates that memory.
    - Otherwise, it creates a new memory entry.

    Args:
        user_id (str): The ID of the user to whom the memory belongs.
        vector (list[float]): The embedding vector representing the memory content.
        text (str): The raw text or description associated with the memory.
        memory_type (str, optional): The type/category of memory. Defaults to "conversation".

    Returns:
        None: The function performs an upsert operation directly into Pinecone.
    """
    existing_id = find_similar_memory_id(user_id, vector)
    timestamp = datetime.utcnow().isoformat()

    vector_id = existing_id or f"{user_id}-{abs(hash(text))}"

    index.upsert([
        (
            vector_id,
            vector,
            {
                "user_id": user_id,
                "text": text,
                "type": memory_type,
                "timestamp": timestamp
            }
        )
    ])