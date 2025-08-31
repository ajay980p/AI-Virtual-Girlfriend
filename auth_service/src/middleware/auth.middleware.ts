import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { JWTUtil } from '../utils/jwt';
import { AuthenticatedRequest } from '../types/express.types';
import { ApiResponse } from '../types/api.types';
import { IUserResponse } from '../types/user.types';

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = JWTUtil.extractTokenFromHeader(authHeader);

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Access token is required'
      };
      res.status(401).json(response);
      return;
    }

    // Verify the token
    const decoded = JWTUtil.verifyAccessToken(token);

    // Find the user
    const user = await User.findById(decoded.userId);
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      res.status(401).json(response);
      return;
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      const response: ApiResponse = {
        success: false,
        message: 'Account is temporarily locked due to multiple failed login attempts'
      };
      res.status(423).json(response);
      return;
    }

    // Attach user to request
    req.user = user.toJSON() as unknown as IUserResponse;
    next();
  } catch (error: any) {
    const response: ApiResponse = {
      success: false,
      message: error.message || 'Authentication failed'
    };
    res.status(401).json(response);
  }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuthenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTUtil.extractTokenFromHeader(authHeader);

    if (!token) {
      next();
      return;
    }

    const decoded = JWTUtil.verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (user && !user.isAccountLocked()) {
      req.user = user.toJSON() as unknown as IUserResponse;
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

/**
 * Middleware to check if user is verified
 */
export const requireEmailVerification = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required'
    };
    res.status(401).json(response);
    return;
  }

  if (!req.user.isEmailVerified) {
    const response: ApiResponse = {
      success: false,
      message: 'Email verification required'
    };
    res.status(403).json(response);
    return;
  }

  next();
};

/**
 * Middleware to check if user owns the resource
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      const response: ApiResponse = {
        success: false,
        message: 'Authentication required'
      };
      res.status(401).json(response);
      return;
    }

    const resourceUserId = req.params[userIdParam];
    if (req.user._id !== resourceUserId) {
      const response: ApiResponse = {
        success: false,
        message: 'Access denied'
      };
      res.status(403).json(response);
      return;
    }

    next();
  };
};