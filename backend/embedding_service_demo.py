"""
Demo script showing how to use the enhanced embedding service functions.
This demonstrates various ways other functions can utilize the embedding service.
"""

import asyncio
import sys
import os

# Add the app directory to the path so we can import our services
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.embedding_service import (
    embed_text, 
    embed_texts_batch, 
    get_embedding_dimension, 
    get_model_info, 
    validate_embedding_service
)


async def demo_single_embedding():
    """Demo: Generate embedding for a single text."""
    print("=== Single Text Embedding Demo ===")
    
    text = "Hello, I'm excited to chat with you today!"
    try:
        embedding = await embed_text(text)
        print(f"✅ Generated embedding for: '{text}'")
        print(f"📏 Embedding dimension: {len(embedding)}")
        print(f"🔢 First 5 values: {embedding[:5]}")
    except Exception as e:
        print(f"❌ Error: {e}")
    print()


async def demo_batch_embedding():
    """Demo: Generate embeddings for multiple texts at once."""
    print("=== Batch Text Embedding Demo ===")
    
    texts = [
        "I love pizza and pasta!",
        "What's the weather like today?",
        "Tell me a funny joke please.",
        "I'm feeling a bit sad today."
    ]
    
    try:
        embeddings = await embed_texts_batch(texts)
        print(f"✅ Generated embeddings for {len(texts)} texts")
        
        for i, (text, embedding) in enumerate(zip(texts, embeddings)):
            print(f"Text {i+1}: '{text}' -> Embedding dim: {len(embedding)}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    print()


def demo_model_info():
    """Demo: Get information about the embedding model."""
    print("=== Model Information Demo ===")
    
    dimension = get_embedding_dimension()
    model_info = get_model_info()
    
    print(f"📊 Embedding dimension: {dimension}")
    print(f"🤖 Model info: {model_info}")
    print()


async def demo_service_validation():
    """Demo: Validate that the embedding service is working."""
    print("=== Service Validation Demo ===")
    
    is_working = await validate_embedding_service()
    if is_working:
        print("✅ Embedding service is working correctly!")
    else:
        print("❌ Embedding service has issues.")
    print()


async def demo_usage_in_chat_context():
    """Demo: Show how this would be used in a chat context (similar to your memory_service)."""
    print("=== Chat Context Usage Demo ===")
    
    # Simulate user messages
    user_messages = [
        "Hi there! My name is Alex.",
        "I work as a software engineer.",
        "I really enjoy playing guitar in my free time.",
        "Can you help me with some coding questions?"
    ]
    
    print("💬 Processing user messages for memory storage...")
    
    try:
        # Generate embeddings for all messages
        embeddings = await embed_texts_batch(user_messages)
        
        print(f"✅ Generated embeddings for {len(user_messages)} messages")
        
        # Simulate what your memory service does
        for i, (message, embedding) in enumerate(zip(user_messages, embeddings)):
            print(f"Message {i+1}: '{message}'")
            print(f"  → Ready for vector storage (dim: {len(embedding)})")
            
        # Simulate retrieving context for a new message
        new_message = "What did I tell you about my hobbies?"
        new_embedding = await embed_text(new_message)
        print(f"\n🔍 New query: '{new_message}'")
        print(f"  → Query embedding ready (dim: {len(new_embedding)})")
        print("  → Would now search for similar vectors in Pinecone...")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    print()


async def main():
    """Run all demos."""
    print("🚀 Embedding Service Enhanced Functionality Demo\n")
    
    # Check if service is working first
    await demo_service_validation()
    
    # Show model information
    demo_model_info()
    
    # Demo individual functions
    await demo_single_embedding()
    await demo_batch_embedding()
    await demo_usage_in_chat_context()
    
    print("🎉 Demo completed!")


if __name__ == "__main__":
    asyncio.run(main())