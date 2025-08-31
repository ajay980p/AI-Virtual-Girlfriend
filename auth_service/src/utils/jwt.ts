import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config';
import { IJWTPayload, IAuthTokens } from '../types/user.types';

export class JWTUtil {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<IJWTPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'access' },
      config.jwt.secret,
      { 
        expiresIn: config.jwt.expiresIn,
        issuer: 'ai-girlfriend-auth-service',
        audience: 'ai-girlfriend-app'
      }
    );
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<IJWTPayload, 'type'>): string {
    return jwt.sign(
      { ...payload, type: 'refresh' },
      config.jwt.refreshSecret,
      { 
        expiresIn: config.jwt.refreshExpiresIn,
        issuer: 'ai-girlfriend-auth-service',
        audience: 'ai-girlfriend-app'
      }
    );
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(userId: string, email: string): IAuthTokens {
    const payload = { userId, email };
    
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload)
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): IJWTPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.secret, {
        issuer: 'ai-girlfriend-auth-service',
        audience: 'ai-girlfriend-app'
      }) as IJWTPayload;
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): IJWTPayload {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'ai-girlfriend-auth-service',
        audience: 'ai-girlfriend-app'
      }) as IJWTPayload;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
    
    return parts[1];
  }

  /**
   * Generate secure random token for password reset, email verification, etc.
   */
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash token for storage
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return null;
      
      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    
    return expiration < new Date();
  }

  /**
   * Decode token without verification (for debugging purposes)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}