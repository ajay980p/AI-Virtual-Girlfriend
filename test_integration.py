#!/usr/bin/env python3
"""
Test script to verify backend API integration.
Run this to test if the backend is working correctly.
"""

import requests
import json
import sys

def test_backend_connection():
    """Test basic connection to the backend"""
    try:
        response = requests.get("http://localhost:8000/")
        print(f"✅ Backend connection successful: {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return False

def test_chat_endpoint():
    """Test the chat endpoint"""
    try:
        payload = {
            "user_id": "test_user_123",
            "message": "Hello! This is a test message from the integration test."
        }
        
        response = requests.post(
            "http://localhost:8000/chat/respond",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Chat endpoint successful!")
            print(f"   Request: {payload['message']}")
            print(f"   Response: {result.get('response', 'No response field')}")
            return True
        else:
            print(f"❌ Chat endpoint failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Chat endpoint failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Testing Backend API Integration")
    print("=" * 50)
    
    # Test 1: Basic connection
    print("\n📡 Testing backend connection...")
    if not test_backend_connection():
        print("❌ Cannot connect to backend. Make sure it's running on port 8000.")
        sys.exit(1)
    
    # Test 2: Chat endpoint
    print("\n💬 Testing chat endpoint...")
    if not test_chat_endpoint():
        print("❌ Chat endpoint test failed.")
        sys.exit(1)
    
    print("\n🎉 All tests passed! Backend integration is working correctly.")
    print("\n📝 Next steps:")
    print("   1. Open http://localhost:3000 in your browser")
    print("   2. Navigate to the chat page")
    print("   3. Send a message to test the full integration")

if __name__ == "__main__":
    main()