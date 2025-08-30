from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize the client correctly
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

async def embed_text(text: str) -> list[float]:
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response.data[0].embedding
