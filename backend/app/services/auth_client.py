"""
Auth Service Client for communicating with the Express.js authentication service.
Handles conversation persistence and user authentication.
"""

import httpx
import logging
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# Data models for API communication
class MessageData(BaseModel):
    role: str  # 'user' | 'assistant' | 'system'
    content: str
    meta: Optional[Dict[str, Any]] = None

class ConversationData(BaseModel):
    title: Optional[str] = None
    modelId: Optional[str] = None
    firstMessage: Optional[str] = None

class AuthServiceClient:
    """Client for communicating with the Express.js auth service."""
    
    def __init__(self):
        self.base_url = settings.auth_service_api_url
        self.timeout = 30.0
        
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        auth_token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """Make an HTTP request to the auth service."""
        url = f"{self.base_url}{endpoint}"
        
        # Prepare headers
        request_headers = {
            "Content-Type": "application/json"
        }
        if headers:
            request_headers.update(headers)
        
        # Add authentication header if token provided
        if auth_token:
            request_headers["Authorization"] = f"Bearer {auth_token}"
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.request(
                    method=method,
                    url=url,
                    json=data,
                    headers=request_headers
                )
                
                if response.status_code >= 200 and response.status_code < 300:
                    return response.json()
                else:
                    logger.error(f"Auth service request failed: {response.status_code} - {response.text}")
                    return None
                    
        except httpx.TimeoutException:
            logger.error(f"Timeout when calling auth service: {url}")
            return None
        except httpx.RequestError as e:
            logger.error(f"Request error when calling auth service: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error when calling auth service: {e}")
            return None
    
    async def create_conversation(
        self, 
        user_id: str, 
        title: Optional[str] = None,
        first_message: Optional[str] = None,
        model_id: Optional[str] = None,
        auth_token: Optional[str] = None
    ) -> Optional[str]:
        """
        Create a new conversation.
        Returns the conversation ID if successful, None otherwise.
        """
        data = ConversationData(
            title=title,
            modelId=model_id,
            firstMessage=first_message
        ).dict(exclude_none=True)
        
        response = await self._make_request(
            method="POST",
            endpoint="/conversations",
            data=data,
            auth_token=auth_token
        )
        
        if response and response.get("success"):
            conversation = response.get("data", {}).get("conversation", {})
            return conversation.get("id")
        
        return None
    
    async def add_message_to_conversation(
        self,
        conversation_id: str,
        role: str,
        content: str,
        meta: Optional[Dict[str, Any]] = None,
        auth_token: Optional[str] = None
    ) -> bool:
        """
        Add a message to an existing conversation.
        Returns True if successful, False otherwise.
        """
        data = MessageData(
            role=role,
            content=content,
            meta=meta
        ).dict(exclude_none=True)
        
        response = await self._make_request(
            method="POST",
            endpoint=f"/conversations/{conversation_id}/messages",
            data=data,
            auth_token=auth_token
        )
        
        return response is not None and response.get("success", False)
    
    async def get_conversation(
        self,
        conversation_id: str,
        auth_token: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get a conversation by ID.
        Returns conversation data if successful, None otherwise.
        """
        response = await self._make_request(
            method="GET",
            endpoint=f"/conversations/{conversation_id}",
            auth_token=auth_token
        )
        
        if response and response.get("success"):
            return response.get("data", {}).get("conversation")
        
        return None
    
    async def get_user_conversations(
        self,
        page: int = 1,
        limit: int = 20,
        model_id: Optional[str] = None,
        auth_token: Optional[str] = None
    ) -> Optional[List[Dict[str, Any]]]:
        """
        Get conversations for a user.
        Returns list of conversations if successful, None otherwise.
        """
        params = f"?page={page}&limit={limit}"
        if model_id:
            params += f"&modelId={model_id}"
        
        response = await self._make_request(
            method="GET",
            endpoint=f"/conversations{params}",
            auth_token=auth_token
        )
        
        if response and response.get("success"):
            return response.get("data", {}).get("conversations", [])
        
        return None
    
    async def health_check(self) -> bool:
        """
        Check if the auth service is healthy.
        Returns True if healthy, False otherwise.
        """
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{settings.auth_service_url}/health")
                return response.status_code == 200
        except Exception:
            return False

# Global client instance
auth_client = AuthServiceClient()

def get_auth_client() -> AuthServiceClient:
    """Get the auth service client instance."""
    return auth_client