from typing import Optional
from pydantic import BaseModel

class MemoryRequest(BaseModel):
    user_id: str
    text: str
    memory_type: Optional[str] = "conversation"