"""
Simple test script to verify the chat functionality
"""
import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.schemas.chat import ChatRequest
from app.services.memory_service import generate_chat_response

async def test_chat():
    # Create a test request
    test_request = ChatRequest(
        user_id="test_user_123",
        message="Hello, how are you today?"
    )
    
    try:
        print("Testing chat functionality...")
        print(f"Input: {test_request.message}")
        
        # Generate response
        response = await generate_chat_response(test_request)
        
        print(f"Response: {response}")
        print("✅ Chat test successful!")
        
    except Exception as e:
        print(f"❌ Chat test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_chat())