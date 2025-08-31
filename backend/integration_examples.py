"""
Example integration showing how other functions can use the enhanced embedding service.
This file demonstrates practical usage patterns for your AI Virtual Girlfriend project.
"""

import asyncio
from app.services.embedding_service import (
    embed_text, 
    embed_texts_batch, 
    get_embedding_dimension, 
    get_model_info,
    validate_embedding_service
)


class UserMemoryManager:
    """Example class showing how other components can use the embedding service."""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.embedding_dim = get_embedding_dimension()
    
    async def process_user_profile(self, profile_data: dict) -> dict:
        """Process user profile data and generate embeddings for searchable fields."""
        
        # Extract text fields that should be searchable
        searchable_texts = []
        text_types = []
        
        if profile_data.get('bio'):
            searchable_texts.append(profile_data['bio'])
            text_types.append('bio')
        
        if profile_data.get('interests'):
            searchable_texts.append(', '.join(profile_data['interests']))
            text_types.append('interests')
        
        if profile_data.get('favorite_topics'):
            searchable_texts.append(', '.join(profile_data['favorite_topics']))
            text_types.append('topics')
        
        # Generate embeddings for all texts at once
        if searchable_texts:
            embeddings = await embed_texts_batch(searchable_texts)
            
            # Create embedding map
            embedding_map = {}
            for text_type, embedding in zip(text_types, embeddings):
                embedding_map[f'{text_type}_embedding'] = embedding
            
            return {
                **profile_data,
                'embeddings': embedding_map,
                'embedding_dimension': self.embedding_dim
            }
        
        return profile_data
    
    async def analyze_conversation_sentiment(self, messages: list[str]) -> dict:
        """Analyze conversation messages and prepare them for similarity search."""
        
        if not messages:
            return {'status': 'no_messages'}
        
        # Generate embeddings for all messages
        embeddings = await embed_texts_batch(messages)
        
        return {
            'message_count': len(messages),
            'embeddings': embeddings,
            'dimension': len(embeddings[0]) if embeddings else 0,
            'ready_for_storage': True
        }


class ChatContextBuilder:
    """Example class for building chat context using embeddings."""
    
    async def prepare_context_embeddings(self, context_pieces: list[str]) -> dict:
        """Prepare multiple context pieces for similarity matching."""
        
        if not context_pieces:
            return {'embeddings': [], 'count': 0}
        
        # Use batch embedding for efficiency
        embeddings = await embed_texts_batch(context_pieces)
        
        return {
            'embeddings': embeddings,
            'count': len(embeddings),
            'texts': context_pieces,
            'model_info': get_model_info()
        }
    
    async def find_best_context_match(self, query: str, context_embeddings: list) -> dict:
        """Find the best matching context for a user query."""
        
        # Embed the query
        query_embedding = await embed_text(query)
        
        # In a real implementation, you'd calculate similarity scores here
        # For demo purposes, we'll just return the structure
        return {
            'query_embedding': query_embedding,
            'query_text': query,
            'available_contexts': len(context_embeddings),
            'ready_for_similarity_search': True
        }


async def demo_integration_examples():
    """Run demonstration of how other functions can use the embedding service."""
    
    print("🔧 Testing Embedding Service Integration Examples\\n")
    
    # Test service health first
    is_healthy = await validate_embedding_service()
    if not is_healthy:
        print("❌ Embedding service is not working. Please check your configuration.")
        return
    
    print("✅ Embedding service is healthy!\\n")
    
    # Demo 1: User Profile Processing
    print("📋 Demo 1: User Profile Processing")
    profile_manager = UserMemoryManager("user_123")
    
    sample_profile = {
        'name': 'Alex',
        'bio': 'I love programming, especially Python and AI development.',
        'interests': ['coding', 'music', 'travel', 'photography'],
        'favorite_topics': ['artificial intelligence', 'machine learning', 'web development']
    }
    
    processed_profile = await profile_manager.process_user_profile(sample_profile)
    print(f"✅ Processed profile with {len(processed_profile.get('embeddings', {}))} embeddings")
    print(f"📏 Embedding dimension: {processed_profile.get('embedding_dimension')}\\n")
    
    # Demo 2: Conversation Analysis
    print("💬 Demo 2: Conversation Analysis")
    sample_messages = [
        "Hi there! How are you doing today?",
        "I'm working on a Python project and need some help.",
        "Do you know anything about machine learning?",
        "Thanks for all your help!"
    ]
    
    conversation_analysis = await profile_manager.analyze_conversation_sentiment(sample_messages)
    print(f"✅ Analyzed {conversation_analysis['message_count']} messages")
    print(f"📊 Generated {len(conversation_analysis['embeddings'])} embeddings\\n")
    
    # Demo 3: Context Building
    print("🔍 Demo 3: Chat Context Building")
    context_builder = ChatContextBuilder()
    
    context_pieces = [
        "User enjoys programming in Python",
        "User is interested in AI and machine learning",
        "User likes to travel and take photos",
        "User prefers casual conversation style"
    ]
    
    context_data = await context_builder.prepare_context_embeddings(context_pieces)
    print(f"✅ Prepared {context_data['count']} context embeddings")
    
    # Demo 4: Query Matching
    user_query = "Can you help me with my Python AI project?"
    match_result = await context_builder.find_best_context_match(user_query, context_data['embeddings'])
    print(f"✅ Prepared query embedding for: '{user_query}'")
    print(f"🎯 Ready to match against {match_result['available_contexts']} contexts\\n")
    
    # Demo 5: Model Information
    print("ℹ️  Demo 5: Model Information")
    model_info = get_model_info()
    print(f"🤖 Model: {model_info['repo_id']}")
    print(f"📏 Dimension: {model_info['dimension']}")
    print(f"🔗 Provider: {model_info['provider']}\\n")
    
    print("🎉 All integration demos completed successfully!")


if __name__ == "__main__":
    asyncio.run(demo_integration_examples())