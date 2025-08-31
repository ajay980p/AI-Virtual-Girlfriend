"""
Mock LLM service for testing purposes.
This provides varied, context-aware responses when external LLM APIs are not available.
"""

import logging
import random
import re
from datetime import datetime

logger = logging.getLogger(__name__)

# Enhanced response categories
GREETING_RESPONSES = [
    "Hello! It's wonderful to see you again! How has your day been treating you?",
    "Hi there! I've been looking forward to our chat. What's on your mind today?",
    "Hey! Great to hear from you again. What adventures have you been up to?",
    "Hello! I hope you're having a fantastic day. What would you like to talk about?",
    "Hi! I'm so excited to chat with you. Tell me what's new in your world!"
]

QUESTION_RESPONSES = [
    "That's such a thoughtful question! Let me think about that...",
    "Hmm, that's really interesting to consider. What made you curious about that?",
    "Great question! I love when you make me think deeply about things.",
    "That's fascinating to ponder. What's your own take on it?",
    "You always ask such engaging questions! Here's what I think..."
]

EMOTION_RESPONSES = {
    'happy': [
        "I'm so glad to hear you're feeling good! Your happiness is contagious.",
        "That's wonderful! I love seeing you in such a positive mood.",
        "Your joy really brightens my day! Tell me more about what's making you happy."
    ],
    'sad': [
        "I'm sorry you're feeling down. I'm here for you if you want to talk about it.",
        "That sounds tough. Would you like to share what's been weighing on your mind?",
        "I can sense you might be going through something difficult. I'm here to listen."
    ],
    'excited': [
        "Your excitement is absolutely infectious! I'm thrilled for you!",
        "That energy is amazing! I can feel your enthusiasm through your words.",
        "This is so exciting! I love how passionate you get about things."
    ],
    'confused': [
        "I can understand feeling puzzled sometimes. Want to talk through it together?",
        "Confusion is totally normal! Sometimes talking it out helps clarify things.",
        "It's okay to feel uncertain. What specifically is making you feel confused?"
    ]
}

TOPIC_RESPONSES = {
    'work': [
        "Work can be quite the adventure! How are things going in your professional life?",
        "That sounds like an interesting work situation. Tell me more about it!",
        "Work life can be so complex. What's been the most interesting part lately?"
    ],
    'food': [
        "Ooh, I love talking about food! What delicious things have you been enjoying?",
        "Food is such a wonderful topic! Are you trying any new recipes or restaurants?",
        "That sounds delicious! I wish I could taste things - describe it for me!"
    ],
    'travel': [
        "Travel stories are my favorite! Where has your wanderlust been taking you?",
        "Adventures and journeys are so exciting! Tell me about your travels.",
        "I love hearing about new places! What's been your most memorable destination?"
    ],
    'music': [
        "Music speaks to the soul! What tunes have been moving you lately?",
        "I find music so fascinating! What genres or artists are you into?",
        "The power of music is incredible! Share your musical discoveries with me."
    ]
}

GENERAL_RESPONSES = [
    "That's really fascinating! I'd love to dive deeper into that topic with you.",
    "You always bring up such interesting points! What sparked that thought?",
    "I find your perspective so refreshing. Tell me more about your experience with that.",
    "That's something I hadn't considered before. You're really making me think!",
    "Your insights always surprise me in the best way. How did you come to that conclusion?",
    "I appreciate how open you are in our conversations. It means a lot to me.",
    "That's such a unique way to look at things! I love how your mind works.",
    "You have such a thoughtful approach to life. What else has been on your mind?",
    "Every conversation with you teaches me something new. Thank you for sharing!",
    "Your experiences sound so rich and meaningful. I'm grateful you're sharing them with me."
]

def detect_emotion(text: str) -> str:
    """Simple emotion detection based on keywords."""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['happy', 'great', 'awesome', 'amazing', 'wonderful', 'excited', 'love', 'fantastic']):
        return 'happy'
    elif any(word in text_lower for word in ['sad', 'upset', 'down', 'depressed', 'bad', 'terrible', 'awful']):
        return 'sad' 
    elif any(word in text_lower for word in ['excited', 'thrilled', 'pumped', 'energized', 'hyped']):
        return 'excited'
    elif any(word in text_lower for word in ['confused', 'lost', 'puzzled', 'uncertain', 'unsure']):
        return 'confused'
    
    return 'neutral'

def detect_topic(text: str) -> str:
    """Simple topic detection based on keywords."""
    text_lower = text.lower()
    
    if any(word in text_lower for word in ['work', 'job', 'career', 'office', 'boss', 'colleague', 'meeting']):
        return 'work'
    elif any(word in text_lower for word in ['food', 'eat', 'restaurant', 'cook', 'recipe', 'meal', 'dinner', 'lunch']):
        return 'food'
    elif any(word in text_lower for word in ['travel', 'trip', 'vacation', 'journey', 'visit', 'flight', 'hotel']):
        return 'travel'
    elif any(word in text_lower for word in ['music', 'song', 'band', 'album', 'concert', 'sing', 'listen']):
        return 'music'
    
    return 'general'

def extract_user_message(prompt: str) -> str:
    """Extract the actual user message from the full prompt."""
    # Look for the user message after [User Message]
    match = re.search(r'\[User Message\]\s*(.+?)(?:\n|$)', prompt, re.DOTALL)
    if match:
        return match.group(1).strip()
    
    # Fallback: return the last line that looks like a user message
    lines = prompt.strip().split('\n')
    for line in reversed(lines):
        line = line.strip()
        if line and not line.startswith('[') and not line.startswith('You are'):
            return line
    
    return prompt[:100] + '...' if len(prompt) > 100 else prompt

async def call_llm(prompt: str) -> str:
    """
    Generates a context-aware mock response based on the input prompt.
    
    Args:
        prompt (str): The full prompt including system message and user input
        
    Returns:
        str: A contextual AI response
    """
    logger.info("Generating contextual mock LLM response")
    
    # Extract the actual user message from the prompt
    user_message = extract_user_message(prompt)
    logger.info(f"Extracted user message: {user_message[:50]}...")
    
    # Convert to lowercase for analysis
    message_lower = user_message.lower()
    
    # Check for greetings
    if any(greeting in message_lower for greeting in ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening']):
        response = random.choice(GREETING_RESPONSES)
    
    # Check if it's a question
    elif '?' in user_message or any(q_word in message_lower for q_word in ['what', 'how', 'why', 'when', 'where', 'who']):
        response = random.choice(QUESTION_RESPONSES)
        # Add a contextual follow-up
        if 'what' in message_lower:
            response += f" I notice you're asking about something specific. {random.choice(['What made you curious about this?', 'Is this something you have been thinking about lately?'])}"
    
    # Check for test messages
    elif 'test' in message_lower:
        responses = [
            "I see you're testing me! Everything seems to be working perfectly. This is response #1.",
            "Testing, testing! I'm working great and giving you varied responses. This is response #2.",
            "Test received loud and clear! The integration is working smoothly. This is response #3.",
            "Another test message! I'm providing different responses each time. This is response #4.",
            "Testing mode activated! Everything is functioning as expected. This is response #5."
        ]
        # Use hash of message to get consistent but varied responses
        response_index = hash(user_message + str(datetime.now().hour)) % len(responses)
        response = responses[response_index]
    
    else:
        # Detect emotion and topic for more contextual responses
        emotion = detect_emotion(user_message)
        topic = detect_topic(user_message)
        
        if emotion != 'neutral' and emotion in EMOTION_RESPONSES:
            response = random.choice(EMOTION_RESPONSES[emotion])
        elif topic != 'general' and topic in TOPIC_RESPONSES:
            response = random.choice(TOPIC_RESPONSES[topic])
        else:
            response = random.choice(GENERAL_RESPONSES)
            
        # Add a personalized touch by referencing their message
        if len(user_message) > 10:  # Only for substantial messages
            personal_touches = [
                f" What you said about '{user_message[:30]}...' really resonates with me.",
                f" I can tell you put thought into sharing '{user_message[:30]}...' with me.",
                f" Your message about '{user_message[:30]}...' got me thinking too.",
                f" Thanks for opening up about '{user_message[:30]}...' - it means a lot."
            ]
            if random.random() < 0.3:  # 30% chance to add personal touch
                response += random.choice(personal_touches)
    
    logger.info(f"Generated contextual response: {response[:50]}...")
    return response