import { Request, RequestHandler } from 'express';
import jwt, { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { IAuthUser } from '../types/express';

const JWT_SECRET = process.env.JWT_SECRET as string;

function extractToken(req: Request): string | null {
    const authHeader = req.header('authorization') || req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7).trim();
    }
    // fallback: cookie
    const cookieToken = (req as any).cookies?.access_token;
    if (cookieToken && typeof cookieToken === 'string') {
        return cookieToken;
    }
    return null;
}

export const authMiddleware: RequestHandler = (req, res, next) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ success: false, message: 'Unauthorized: token missing' });
        }

        const payload = jwt.verify(token, JWT_SECRET) as any;

        // attach minimal user info
        req.user = {
            id: payload.sub || payload.userId,
            email: payload.email,
            roles: payload.roles ?? [],
            token,
        } as IAuthUser;

        next();
    } catch (err) {
        if (err instanceof TokenExpiredError) {
            return res.status(401).json({ success: false, code: 'TOKEN_EXPIRED', message: 'Access token expired' });
        }
        if (err instanceof JsonWebTokenError) {
            return res.status(401).json({ success: false, code: 'INVALID_TOKEN', message: 'Invalid token' });
        }
        return res.status(500).json({ success: false, message: 'Auth verification failed' });
    }
};