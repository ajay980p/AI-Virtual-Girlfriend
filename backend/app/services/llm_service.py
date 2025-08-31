import httpx
import os
from dotenv import load_dotenv

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def call_llm(prompt: str) -> str:
    if not OPENROUTER_API_KEY:
        raise ValueError("OPENROUTER_API_KEY is not configured")
    
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
    except Exception as e:
        raise ConnectionError(f"Failed to communicate with LLM service: {str(e)}")