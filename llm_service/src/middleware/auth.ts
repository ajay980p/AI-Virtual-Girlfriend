import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export type UserClaims = {
    userId: string;
    email?: string;
    roles?: string[];
    type?: string; // 'access' | 'refresh'
};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            user?: UserClaims | null;
            token?: string | null;
        }
    }
}

function extractToken(req: Request): string | null {
    const authHeader = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
    if (authHeader && authHeader.startsWith('Bearer ')) return authHeader.slice(7).trim();
    const cookieToken = req.cookies?.access_token;
    return typeof cookieToken === 'string' ? cookieToken : null;
}

function decodeToken(token: string): UserClaims {
    if (!config.jwtSecret) {
        throw Object.assign(new Error('JWT secret not configured'), { status: 500 });
    }
    const payload = jwt.verify(token, config.jwtSecret) as any;
    return {
        userId: String(payload.userId || payload.sub || ''),
        email: payload.email,
        roles: payload.roles,
        type: payload.type,
    };
}

export function attachAuth(req: Request, _res: Response, next: NextFunction) {
    req.user = null;
    req.token = null;
    const token = extractToken(req);
    if (token) {
        try {
            const claims = decodeToken(token);
            if (!claims.type || claims.type === 'access') {
                req.token = token;
                if (claims.userId) req.user = claims;
            }
        } catch {
            // non-blocking
            req.user = null;
            req.token = null;
        }
    }
    next();
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    next();
}
