import jwt, { type Secret, type SignOptions, type JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config';
import { IJWTPayload, IAuthTokens } from '../types/user.types';

const ACCESS_SECRET: Secret = config.jwt.secret;
const REFRESH_SECRET: Secret = config.jwt.refreshSecret;

const ACCESS_EXPIRES_IN: SignOptions['expiresIn'] =
  (config.jwt.expiresIn as SignOptions['expiresIn']) || '15m';

const REFRESH_EXPIRES_IN: SignOptions['expiresIn'] =
  (config.jwt.refreshExpiresIn as SignOptions['expiresIn']) || '7d';

export class JWTUtil {
 
  static generateAccessToken(payload: Omit<IJWTPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'access' },
      ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRES_IN }
    );
  }

  static generateRefreshToken(payload: Omit<IJWTPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES_IN }
    );
  }

  static generateTokenPair(userId: string, email: string): IAuthTokens {
    const payload = { userId, email };
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  static verifyAccessToken(token: string): IJWTPayload {
    try {
      const decoded = jwt.verify(token, ACCESS_SECRET) as JwtPayload & IJWTPayload | string;
      if (typeof decoded === 'string' || decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) throw new Error('Access token expired');
      if (error instanceof jwt.JsonWebTokenError) throw new Error('Invalid access token');
      throw new Error('Token verification failed');
    }
  }

  static verifyRefreshToken(token: string): IJWTPayload {
    try {
      const decoded = jwt.verify(token, REFRESH_SECRET) as JwtPayload & IJWTPayload | string;
      if (typeof decoded === 'string' || decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) throw new Error('Refresh token expired');
      if (error instanceof jwt.JsonWebTokenError) throw new Error('Invalid refresh token');
      throw new Error('Token verification failed');
    }
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    return parts[1];
  }

  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload | null;
      if (!decoded || !decoded.exp) return null;
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return expiration < new Date();
  }

  static decodeToken(token: string): JwtPayload | string | null {
    try {
      return jwt.decode(token);
    } catch {
      return null;
    }
  }
}