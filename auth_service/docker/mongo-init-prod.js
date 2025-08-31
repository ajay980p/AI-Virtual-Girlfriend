// MongoDB initialization script for production
db = db.getSiblingDB('ai_girlfriend_auth');

// Create application user with environment variables
db.createUser({
  user: process.env.MONGO_APP_USERNAME || 'authuser',
  pwd: process.env.MONGO_APP_PASSWORD || 'changethisinproduction',
  roles: [
    {
      role: 'readWrite',
      db: 'ai_girlfriend_auth'
    }
  ]
});

print('MongoDB production user created successfully');