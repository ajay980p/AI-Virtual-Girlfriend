# Chat Service API

A TypeScript Express.js service for handling chat conversations and messages for the AI Virtual Girlfriend application.

## Features

- 🚀 Express.js with TypeScript
- 📚 Swagger API documentation
- 🔐 JWT authentication middleware
- 💾 MongoDB with Mongoose
- 🔒 Security middleware (Helmet, CORS)
- 📝 Request logging with Morgan
- ⚡ Request rate limiting
- 🗜️ Response compression
- 🧪 Jest testing setup
- 🔧 Development with nodemon

## API Documentation

Once the server is running, you can access the interactive API documentation at:

**Swagger UI:** `http://localhost:6000/api-docs`

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- MongoDB instance running
- npm >= 8.0.0

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:6000`

## Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run build:watch` - Build in watch mode
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run clean` - Clean build directory

## API Endpoints

### Health & Info
- `GET /` - Service information
- `GET /health` - Health check
- `GET /api/public-info` - Public service info

### Conversations
- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create new conversation
- `PATCH /api/conversations/:id` - Update conversation
- `DELETE /api/conversations/:id` - Delete conversation

### Messages
- `GET /api/conversations/:id/messages` - Get conversation messages
- `POST /api/conversations/:id/messages` - Send message

## Authentication

All conversation and message endpoints require authentication via:
- Bearer token in Authorization header: `Authorization: Bearer <token>`
- Or JWT token in cookies: `token=<jwt_token>`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `6000` |
| `NODE_ENV` | Environment | `development` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/chat_service` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `1h` |
| `API_URL` | API base URL for Swagger | `http://localhost:6000` |
| `CORS_ORIGIN` | CORS allowed origin | `http://localhost:3000` |

## Project Structure

```
chat_service/
├── src/
│   ├── config/
│   │   └── swagger.ts          # Swagger configuration
│   ├── controllers/            # Route controllers
│   ├── middlewares/            # Custom middleware
│   │   └── auth.ts            # Authentication middleware
│   ├── models/                # Database models
│   │   ├── Conversation.model.ts
│   │   └── Message.model.ts
│   ├── routes/                # API routes
│   │   ├── index.ts           # Route aggregator
│   │   └── conversations.ts   # Conversation routes
│   ├── services/              # Business logic
│   ├── utils/                 # Utility functions
│   ├── app.ts                 # Express app configuration
│   └── server.ts              # Server startup
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tsconfig.build.json        # Build-specific TS config
├── nodemon.json               # Nodemon configuration
└── README.md                  # This file
```

## Testing the API

### Using Swagger UI
1. Start the server: `npm run dev`
2. Open `http://localhost:6000/api-docs`
3. Use the interactive interface to test endpoints

### Using curl
```bash
# Health check
curl http://localhost:6000/health

# Get conversations (requires auth token)
curl -H "Authorization: Bearer <your-jwt-token>" \
     http://localhost:6000/api/conversations
```

## Development

### Adding New Routes
1. Create route file in `src/routes/`
2. Add Swagger documentation using JSDoc comments
3. Export and mount in `src/routes/index.ts`

### Code Quality
- ESLint for code linting
- TypeScript for type safety
- Jest for testing
- Prettier for code formatting (optional)

## License

MIT