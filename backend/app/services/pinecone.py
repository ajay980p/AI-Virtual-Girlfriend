import os
import pinecone
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENVIRONMENT")
INDEX_NAME = os.getenv("PINECONE_INDEX")

pinecone.init(api_key=PINECONE_API_KEY, environment=PINECONE_ENV)
index = pinecone.Index(INDEX_NAME)

async def query_memory(user_id: str, vector: list[float]):
    result = index.query(
        vector=vector,
        top_k=5,
        include_metadata=True,
        filter={ "user_id": user_id }
    )
    return result.matches
