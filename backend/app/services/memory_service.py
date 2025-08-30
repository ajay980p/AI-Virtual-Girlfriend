from app.services.embedding_service import embed_text
from app.services.llm_service import call_llm
from app.services.pinecone_service import query_memory

SYSTEM_PROMPT = """
You are Aria — a caring, playful, and emotionally intelligent AI companion.
You always remember important details about the user. Speak casually and warmly.
"""

async def generate_chat_response(payload):
    # Step 1: Embed user message
    embedded_query = await embed_text(payload.message)

    # Step 2: Retrieve relevant memories from Pinecone
    retrieved_memories = await query_memory(user_id=payload.user_id, vector=embedded_query)

    # Step 3: Build prompt with memory context
    context = "\n".join([m['metadata']['text'] for m in retrieved_memories])
    full_prompt = f"{SYSTEM_PROMPT}\n\n[User's Past Memories]\n{context}\n\n[User Message]\n{payload.message}"

    # Step 4: Call OpenAI LLMs
    return call_llm(full_prompt)