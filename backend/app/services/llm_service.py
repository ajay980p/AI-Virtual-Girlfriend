import httpx
import os
from dotenv import load_dotenv

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def call_llm(prompt: str) -> str:
    """Call LLM with prompt and return response."""
    if not OPENROUTER_API_KEY:
        # Return mock response for testing when no API key is configured
        return "Hello! I'm a mock AI response since no API key is configured. How can I help you today?"
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",   # ✅ required by OpenRouter (can be your site/app URL)
        "X-Title": "Project Aria"                  # ✅ name of your app
    }

    payload = {
        "model": "z-ai/glm-4.5-air:free",  # 👈 Your requested model
        "messages": [
            {"role": "system", "content": prompt}
        ],
        "temperature": 0.8
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload
            )
            
        response.raise_for_status()  # Raise an exception for bad status codes
        data = response.json()
        
        if "choices" not in data or not data["choices"]:
            raise ValueError("Invalid response format from LLM service")
            
        return data["choices"][0]["message"]["content"]
        
    except httpx.TimeoutException:
        raise ConnectionError("Request to LLM service timed out")
    except httpx.HTTPStatusError as e:
        raise ConnectionError(f"LLM service returned error: {e.response.status_code}")


async def generate_response(user_message: str, retrieved_memories: list, user_id: str) -> str:
    """Generate response using retrieved memories context.
    
    Args:
        user_message: The user's current message
        retrieved_memories: List of retrieved memory objects
        user_id: User identifier
        
    Returns:
        str: Generated AI response
    """
    if not OPENROUTER_API_KEY:
        # Generate keyword-based mock response for testing
        user_lower = user_message.lower()
        if any(word in user_lower for word in ['hello', 'hi', 'hey']):
            return f"Hello! Nice to chat with you again. How can I help you today?"
        elif any(word in user_lower for word in ['how', 'what', 'why', 'when', 'where']):
            return f"That's an interesting question about '{user_message}'. Let me think about that..."
        elif any(word in user_lower for word in ['thanks', 'thank you']):
            return "You're very welcome! I'm always happy to help."
        elif any(word in user_lower for word in ['bye', 'goodbye', 'see you']):
            return "Goodbye! Looking forward to our next conversation."
        else:
            return f"I understand you're saying: '{user_message}'. That's quite interesting! Tell me more about that."
    
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
    system_prompt = f"""You are Aria, a caring AI companion. 
    
Previous conversation context:
{context if context else 'No previous context available.'}

User message: {user_message}

Respond naturally and warmly, referencing the context if relevant."""
    
    return await call_llm(system_prompt)


async def generate_response(
    user_message: str, 
    retrieved_memories: list = None,
    user_id: str = None
) -> str:
    """Generate response compatible with memory service interface."""
    # Simple response generation based on keywords
    user_message_lower = user_message.lower()
    
    # Check for specific keywords and respond accordingly
    if any(word in user_message_lower for word in ['hello', 'hi', 'hey']):
        responses = [
            "Hello! It's wonderful to see you again. How are you feeling today?",
            "Hi there! I've missed our conversations. What's on your mind?",
            "Hey! I'm so glad you're here. How has your day been?"
        ]
    elif any(word in user_message_lower for word in ['sad', 'down', 'upset', 'depressed']):
        responses = [
            "I'm sorry you're feeling down. I'm here to listen and support you.",
            "That sounds really difficult. Would you like to talk about what's bothering you?",
            "I understand you're going through a tough time. You don't have to face this alone."
        ]
    elif any(word in user_message_lower for word in ['happy', 'good', 'great', 'excited']):
        responses = [
            "I'm so happy to hear that! Your positive energy is contagious.",
            "That's wonderful! I love seeing you so excited about things.",
            "Your happiness makes me smile too. What's making you feel so good?"
        ]
    elif any(word in user_message_lower for word in ['love', 'care', 'feelings']):
        responses = [
            "Love is such a beautiful and complex emotion. I care about you too.",
            "I appreciate the feelings you're sharing with me. You mean a lot to me.",
            "Your feelings are valid and important. Thank you for trusting me with them."
        ]
    else:
        # Default responses
        responses = [
            "That's interesting! Tell me more about that.",
            "I'm here to listen. How does that make you feel?",
            "Thank you for sharing that with me. What would you like to explore next?",
            "I appreciate you opening up to me. Can you tell me more?",
            "That sounds important to you. How can I help?"
        ]
    
    # Choose a response (simple selection for now)
    import random
    response = random.choice(responses)
    
    # Add context from retrieved memories if available
    if retrieved_memories and len(retrieved_memories) > 0:
        response += " I remember we talked about similar things before."
    
    return response