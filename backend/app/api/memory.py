from fastapi import APIRouter, HTTPException
from app.schemas.memory import MemoryRequest
from app.services.embedding_service import embed_text
from app.services.pinecone_service import upsert_memory

router = APIRouter()


@router.get("/ping")
def test():
    return {"msg": "pong"}



@router.post("/")
async def store_memory(payload: MemoryRequest):
    try:
        # 1. Embed the text
        vector = await embed_text(payload.text)

        # 2. Upsert to Pinecone (with dedup + timestamp)
        upsert_memory(
            user_id=payload.user_id,
            vector=vector,
            text=payload.text,
            memory_type=payload.memory_type
        )

        return { "message": "🧠 Memory stored or updated successfully!" }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))