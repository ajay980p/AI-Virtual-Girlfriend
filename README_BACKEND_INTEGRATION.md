# AI Virtual Girlfriend - Backend Integration

This project now supports real-time communication between the frontend and backend API.

## Quick Start

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Configuration
Make sure the frontend can connect to the backend:
- Frontend runs on: `http://localhost:3000`
- Backend runs on: `http://localhost:8000`
- Environment variables are configured in `frontend/.env.local`

## Features

### Chat Integration
- **Real-time Chat**: Messages are sent to the backend AI service
- **Connection Status**: Visual indicators show backend connectivity
- **Error Handling**: Graceful error messages for connection issues
- **Loading States**: Visual feedback during message processing
- **User Sessions**: Each user gets a unique ID for personalized conversations

### API Endpoints
- `POST /chat/respond`: Send messages and receive AI responses
- `POST /memory/`: Store conversation memories
- `GET /ping`: Health check endpoint
- `GET /`: Root test endpoint

### Error Handling
- Network connection errors
- Backend service unavailable
- Invalid requests
- Rate limiting (if configured)

## Testing the Integration

1. **Start the backend** (must be running first)
2. **Start the frontend**
3. **Open browser** to `http://localhost:3000`
4. **Navigate to chat** and send a message
5. **Check connection status** in the UI

### Connection Status Indicators
- 🟢 **Green dot**: Connected to backend
- 🔴 **Red dot**: Backend unavailable
- 🟡 **Yellow dot**: Checking connection

### Troubleshooting

#### Backend Not Responding
```bash
# Check if backend is running
curl http://localhost:8000/ping

# Check backend logs for errors
# Look for startup errors or missing dependencies
```

#### Frontend Can't Connect
1. Check `.env.local` has correct backend URL
2. Verify CORS settings in backend
3. Check browser console for error messages
4. Ensure no firewall blocking ports

#### Common Issues
- **Port conflicts**: Make sure ports 3000 and 8000 are available
- **Environment variables**: Verify `NEXT_PUBLIC_BACKEND_URL` is set
- **Dependencies**: Run `npm install` and `pip install -r requirements.txt`

## Technical Details

### Frontend Architecture
- **API Client**: Centralized HTTP client with error handling
- **State Management**: Zustand store with async operations
- **Error Boundaries**: Graceful error display and recovery
- **Real-time UI**: Loading states and connection indicators

### Backend Integration
- **FastAPI**: Modern Python API framework
- **Pydantic**: Request/response validation
- **CORS**: Cross-origin request support
- **Error Handling**: Structured error responses

### Data Flow
```
Frontend UI → API Client → Backend API → AI Services → Response → Frontend UI
```

This integration provides a seamless chat experience with reliable backend communication and comprehensive error handling.