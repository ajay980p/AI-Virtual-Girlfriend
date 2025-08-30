import httpx
import os
from dotenv import load_dotenv

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

async def call_llm(prompt: str) -> str:
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

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload
        )

    data = response.json()
    return data["choices"][0]["message"]["content"]