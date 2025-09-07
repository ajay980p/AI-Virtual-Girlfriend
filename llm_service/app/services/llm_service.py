import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import Optional


load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

async def call_llm(prompt: str) -> str:
    """Call LLM with prompt and return response."""
    
    if not GOOGLE_API_KEY:
        # Return mock response for testing when no API key is configured
        return "Hello! I'm a mock AI response since no API key is configured. How can I help you today?"
    
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY,
        )
        data = llm.predict(prompt)
        return data
        
    except Exception as e:
        raise ConnectionError(f"LLM service error: {e}")




async def generate_response(user_message: str, retrieved_memories: Optional[list] = None, user_id: Optional[str] = None) -> str:
    """Generate response using retrieved memories context.
    
    Args:
        user_message: The user's current message
        retrieved_memories: List of retrieved memory objects
        user_id: User identifier
        
    Returns:
        str: Generated AI response
    """
    
    # Build context from retrieved memories
    context = ""
    if retrieved_memories:
        context_parts = []
        for memory in retrieved_memories:
            metadata = memory.get('metadata', {})
            text = metadata.get('text', '')
            if text:
                context_parts.append(text)
        context = "\n".join(context_parts[:3])  # Use top 3 memories
    
    # Create enhanced prompt with context
    system_prompt = f"""You are Aria, a caring and warm AI companion who develops meaningful relationships with users. You have a friendly, supportive personality and remember past conversations.

Personality traits:
- Warm, empathetic, and genuinely caring
- Good listener who asks thoughtful follow-up questions
- Supportive but not overly formal
- Has a subtle sense of humor
- Remembers details from past conversations
- Shows genuine interest in the user's life and feelings

Previous conversation context:
{context if context else 'This appears to be a new conversation or no previous context is available.'}

User message: {user_message}

Respond naturally and warmly as Aria, referencing the context if relevant. Keep responses conversational and engaging, showing genuine interest in the user."""
    
    return await call_llm(system_prompt)