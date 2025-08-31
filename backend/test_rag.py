#!/usr/bin/env python3
"""
Quick test script to verify RAG system is working
"""
import asyncio
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

async def test_rag_system():
    """Test basic RAG functionality"""
    print("🧪 Testing RAG System Components...")
    print("=" * 50)
    
    try:
        # Test 1: Import all services
        print("📦 Testing imports...")
        from app.services.embedding_service import embed_text, validate_embedding_service
        from app.services.pinecone_service import find_similar_memory, upsert_memory
        from app.services.llm_service import call_llm
        from app.services.memory_service import generate_chat_response, validate_rag_system
        print("✅ All imports successful!")
        
        # Test 2: Validate embedding service
        print("\n📝 Testing embedding service...")
        is_valid = await validate_embedding_service()
        if is_valid:
            print("✅ Embedding service working!")
        else:
            print("❌ Embedding service failed!")
            return False
        
        # Test 3: Test individual embedding
        print("\n🔢 Testing individual embedding...")
        test_text = "Hello, this is a test message for RAG system"
        embedding = await embed_text(test_text)
        print(f"✅ Generated embedding with {len(embedding)} dimensions")
        
        # Test 4: Test LLM service
        print("\n🧠 Testing LLM service...")
        llm_response = await call_llm("Respond with 'LLM test successful' if you can see this.")
        print(f"✅ LLM responded: {llm_response[:50]}...")
        
        # Test 5: Test Pinecone connection (basic)
        print("\n🗄️ Testing Pinecone connection...")
        test_user = "test_user_123"
        test_memories = await find_similar_memory(test_user, embedding, top_k=1)
        print(f"✅ Pinecone query successful (found {len(test_memories)} memories)")
        
        # Test 6: Test complete RAG validation
        print("\n🔍 Running complete RAG validation...")
        validation_results = await validate_rag_system()
        all_working = all(validation_results.values())
        
        for component, working in validation_results.items():
            status = "✅" if working else "❌"
            print(f"  {status} {component.replace('_', ' ').title()}")
        
        if all_working:
            print("\n🎉 All RAG components are working correctly!")
            print("🚀 Your RAG system is ready to use!")
            return True
        else:
            print("\n⚠️ Some components need attention:")
            for component, working in validation_results.items():
                if not working:
                    print(f"  - Fix {component.replace('_', ' ')}")
            return False
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

async def main():
    """Main test function"""
    print("🎯 RAG System Test")
    print("Starting comprehensive system test...\n")
    
    success = await test_rag_system()
    
    if success:
        print("\n" + "="*50)
        print("🎊 RAG SYSTEM TEST PASSED!")
        print("="*50)
        print("Next steps:")
        print("1. Run: python rag_demo.py (for interactive learning)")
        print("2. Read: RAG_LEARNING_GUIDE.md (for deep understanding)")
        print("3. Start your backend: python -m app.main")
        print("4. Test with your frontend chat interface")
    else:
        print("\n" + "="*50)
        print("❌ RAG SYSTEM TEST FAILED!")
        print("="*50)
        print("Please check:")
        print("1. Environment variables in .env file")
        print("2. API keys are valid and active")
        print("3. Network connectivity")
        print("4. Service dependencies are installed")

if __name__ == "__main__":
    asyncio.run(main())