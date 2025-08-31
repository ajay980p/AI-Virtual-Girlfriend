# AI Virtual Girlfriend - Authentication Service

A robust Express.js TypeScript authentication service providing comprehensive user management, JWT-based authentication, and security features for the AI Virtual Girlfriend application.

## 🚀 Features

### Core Authentication
- **User Registration & Login** - Secure user onboarding with validation
- **JWT Authentication** - Access and refresh token management
- **Password Management** - Change password, forgot/reset password flows
- **Email Verification** - Account verification system
- **Session Management** - Multiple device support with refresh token rotation

### Security Features
- **Account Protection** - Failed login attempt tracking and account locking
- **Rate Limiting** - Configurable rate limits for different endpoint types
- **Password Security** - Bcrypt hashing with configurable salt rounds
- **Secure Cookies** - HttpOnly, Secure, SameSite cookie configuration
- **CORS Protection** - Configurable origin validation
- **Input Validation** - Comprehensive request validation with Joi

### API Documentation
- **Swagger/OpenAPI 3.0** - Interactive API documentation
- **Type Safety** - Full TypeScript implementation
- **Error Handling** - Consistent error responses and logging

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT)
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: Nodemon, ESLint, ts-node

## 📁 Project Structure

```
auth_service/
├── src/
│   ├── config/           # Configuration files
│   │   ├── index.ts      # Main configuration
│   │   ├── database.ts   # MongoDB connection
│   │   └── swagger.ts    # API documentation setup
│   ├── controllers/      # Route controllers
│   │   ├── auth.controller.ts
│   │   └── index.ts
│   ├── middleware/       # Custom middleware
│   │   ├── auth.middleware.ts      # Authentication middleware
│   │   ├── error.middleware.ts     # Error handling
│   │   ├── rateLimit.middleware.ts # Rate limiting
│   │   ├── validation.middleware.ts # Request validation
│   │   └── index.ts
│   ├── models/           # Database models
│   │   ├── User.ts       # User model with methods
│   │   └── index.ts
│   ├── routes/           # API routes
│   │   ├── auth.routes.ts # Authentication routes
│   │   └── index.ts
│   ├── types/            # TypeScript type definitions
│   │   ├── user.types.ts
│   │   ├── api.types.ts
│   │   ├── express.types.ts
│   │   └── index.ts
│   ├── utils/            # Utility functions
│   │   ├── jwt.ts        # JWT utilities
│   │   └── index.ts
│   ├── app.ts            # Express application setup
│   └── server.ts         # Server entry point
├── docker/               # Docker configuration
│   ├── mongo-init.js     # MongoDB dev initialization
│   └── mongo-init-prod.js # MongoDB prod initialization
├── .env                  # Development environment variables
├── .env.example          # Environment variables template
├── .eslintrc.js          # ESLint configuration
├── .gitignore           # Git ignore rules
├── docker-compose.yml    # Development Docker setup
├── docker-compose.prod.yml # Production Docker setup
├── Dockerfile           # Production Docker image
├── Dockerfile.dev       # Development Docker image
├── nodemon.json         # Nodemon configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # This file
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB 5.0+
- npm or yarn

### Development Setup

1. **Clone and Navigate**
   ```bash
   cd auth_service
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB** (if not using Docker)
   ```bash
   # Using MongoDB Community Edition
   mongod
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Docker Development Setup

1. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - MongoDB on port 27017
   - Auth Service on port 3001
   - Mongo Express (DB Admin) on port 8081

2. **View Logs**
   ```bash
   docker-compose logs -f auth-service
   ```

3. **Stop Services**
   ```bash
   docker-compose down
   ```

## 📚 API Documentation

### Development URLs
- **API Base**: http://localhost:3001/api
- **Swagger Docs**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health
- **MongoDB Admin**: http://localhost:8081 (admin/adminpass)

### Authentication Endpoints

| Method | Endpoint | Description | Authentication Required |
|--------|----------|-------------|------------------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | User login | No |
| POST | `/auth/refresh` | Refresh access token | No |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/logout-all` | Logout from all devices | Yes |
| GET | `/auth/profile` | Get user profile | Yes |
| PATCH | `/auth/profile` | Update user profile | Yes |
| POST | `/auth/change-password` | Change password | Yes |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| POST | `/auth/verify-email` | Verify email address | No |
| POST | `/auth/resend-verification` | Resend verification email | Yes |

### Example Usage

#### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

#### Access Protected Route
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Application environment | development | No |
| `PORT` | Server port | 3001 | No |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/ai_girlfriend_auth_dev | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes (Production) |
| `JWT_REFRESH_SECRET` | Refresh token secret | - | Yes (Production) |
| `JWT_EXPIRE` | Access token expiration | 15m | No |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration | 7d | No |
| `BCRYPT_SALT_ROUNDS` | Password hashing rounds | 10 | No |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 | No |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15min) | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 1000 | No |
| `COOKIE_SECRET` | Cookie signing secret | - | Yes (Production) |
| `COOKIE_SECURE` | Secure cookie flag | false | No |
| `API_DOCS_ENABLED` | Enable Swagger docs | true | No |

### Security Configuration

#### Rate Limiting
- **General Endpoints**: 1000 requests per 15 minutes
- **Auth Endpoints**: 5 requests per 15 minutes
- **Password Reset**: 3 requests per hour
- **Email Verification**: 5 requests per hour

#### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

#### Account Security
- Account locked after 5 failed login attempts
- Lock duration: 2 hours
- Automatic unlock after lock period expires

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## 🏗️ Building and Deployment

### Build for Production
```bash
npm run build
```

### Production Docker Build
```bash
docker build -t ai-girlfriend-auth-service .
```

### Production Deployment with Docker Compose
```bash
# Copy production environment template
cp .env.example .env.production

# Edit production environment variables
nano .env.production

# Deploy with production compose file
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

## 📊 Monitoring and Health Checks

### Health Check Endpoint
```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "success": true,
  "message": "Auth service is healthy",
  "data": {
    "environment": "development",
    "timestamp": "2025-01-09T02:38:00.000Z",
    "uptime": 3600,
    "memoryUsage": {
      "rss": 50331648,
      "heapTotal": 20971520,
      "heapUsed": 15728640,
      "external": 1441792
    },
    "version": "1.0.0"
  }
}
```

### Docker Health Checks
- Container health check every 30 seconds
- Timeout: 3 seconds
- Retries: 3 attempts
- Start period: 5 seconds

## 🔐 Security Best Practices

### Production Deployment
1. **Environment Variables**: Use strong, unique secrets
2. **HTTPS**: Enable SSL/TLS in production
3. **Database Security**: Use MongoDB authentication
4. **Network Security**: Restrict database access
5. **Monitoring**: Implement logging and monitoring
6. **Updates**: Keep dependencies updated

### Recommended Production Settings
```env
NODE_ENV=production
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

### Development Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm test             # Run tests
npm run clean        # Clean build directory
```

## 📝 License

MIT License - see LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@aivirtualgirlfriend.com
- Documentation: http://localhost:3001/api-docs

## 🗺️ Roadmap

- [ ] Email service integration (SendGrid/SES)
- [ ] SMS verification support
- [ ] OAuth integration (Google, Facebook)
- [ ] Two-factor authentication (2FA)
- [ ] Advanced user analytics
- [ ] API key management
- [ ] Role-based access control
- [ ] Audit logging
- [ ] Redis session storage
- [ ] Kubernetes deployment manifests