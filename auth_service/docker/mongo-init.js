// MongoDB initialization script for development
db = db.getSiblingDB('ai_girlfriend_auth');

// Create application user
db.createUser({
  user: 'authuser',
  pwd: 'authpassword',
  roles: [
    {
      role: 'readWrite',
      db: 'ai_girlfriend_auth'
    }
  ]
});

// Create development database
db = db.getSiblingDB('ai_girlfriend_auth_dev');

// Create application user for dev database
db.createUser({
  user: 'authuser',
  pwd: 'authpassword',
  roles: [
    {
      role: 'readWrite',
      db: 'ai_girlfriend_auth_dev'
    }
  ]
});

print('MongoDB users created successfully');