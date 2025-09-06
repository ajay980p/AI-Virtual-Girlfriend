import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
// Ensure we load the .env from the auth_service root even when CWD is monorepo root
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

interface Config {
  app: {
    port: number;
    env: string;
  };
  database: {
    uri: string;
  };
  jwt: {
    secret: string;
    refreshSecret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  security: {
    bcryptSaltRounds: number;
  };
  cors: {
    origin: string[];
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cookie: {
    secret: string;
    secure: boolean;
    httpOnly: boolean;
    sameSite: 'strict' | 'lax' | 'none';
  };
  api: {
    docsEnabled: boolean;
  };
}

// Small helper to mask credentials in URIs for safe logging
const maskMongoUri = (uri?: string): string => {
  if (!uri) return '';
  try {
    return uri.replace(/\/\/.*?@/, '//<credentials>@');
  } catch {
    return uri;
  }
};

// Debug: show where env loaded from and what DB URI is picked in dev
if (process.env.NODE_ENV !== 'production') {
  // Only for local debugging; avoids leaking secrets
  // eslint-disable-next-line no-console
  console.log(`ENV loaded from: ${envPath}`);
  // eslint-disable-next-line no-console
  console.log(`MONGODB_URI (effective): ${maskMongoUri(process.env.MONGODB_URI) || '<not set>'}`);
}

const config: Config = {
  app: {
    port: parseInt(process.env.PORT || '4500', 10),
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_girlfriend_auth_dev',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-jwt-secret-not-for-production' as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-jwt-secret-not-for-production' as string,
    expiresIn: process.env.JWT_EXPIRE || '15m' as string,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' as string,
  },
  security: {
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
      : ['http://localhost:3000'],
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 10),
  },
  cookie: {
    secret: process.env.COOKIE_SECRET || 'dev-cookie-secret-not-for-production',
    secure: process.env.COOKIE_SECURE === 'true',
    httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none') || 'lax',
  },
  api: {
    docsEnabled: process.env.API_DOCS_ENABLED === 'true',
  },
};

// Validate required environment variables in production
if (config.app.env === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGODB_URI',
    'COOKIE_SECRET',
  ];

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }
}

export default config;
