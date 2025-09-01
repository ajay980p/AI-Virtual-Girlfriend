import { Request, Response } from 'express';
import { User } from '../models';
import { JWTUtil } from '../utils/jwt';
import { AppError, asyncHandler } from '../middleware/error.middleware';
import { AuthenticatedRequest } from '../types/express.types';
import { 
  IUserInput, 
  ILoginCredentials, 
  IAuthResponse, 
  IUserResponse,
  IPasswordResetRequest,
  IPasswordReset,
  IChangePassword,
  IUpdateProfile
} from '../types/user.types';
import { ApiResponse } from '../types/api.types';

export class AuthController {
  /**
   * Register a new user
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstName, lastName }: IUserInput = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      isEmailVerified: false,
      refreshTokens: [],
      preferences: {
        communicationStyle: 'friendly'
      },
      loginAttempts: 0
    });

    // Generate tokens
    const tokens = JWTUtil.generateTokenPair((user._id?.toString() || user.id) as string, user.email);

    // Add refresh token to user
    await user.addRefreshToken(tokens.refreshToken);

    // Generate email verification token
    const emailVerificationToken = user.generateEmailVerificationToken();
    await user.save();

    const userResponse = user.toJSON() as unknown as IUserResponse;

    const response: ApiResponse<IAuthResponse> = {
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: userResponse,
        tokens
      }
    };

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json(response);
  });

  /**
   * Login user
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password }: ILoginCredentials = req.body;

    // Find user with password
    const user = await (User as any).findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      throw new AppError('Account is temporarily locked due to multiple failed login attempts', 423);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw new AppError('Invalid email or password', 401);
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = JWTUtil.generateTokenPair((user._id?.toString() || user.id) as string, user.email);

    // Add refresh token to user
    await user.addRefreshToken(tokens.refreshToken);

    const userResponse = user.toJSON() as unknown as IUserResponse;

    const response: ApiResponse<IAuthResponse> = {
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        tokens
      }
    };

    // Set refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json(response);
  });

  /**
   * Refresh access token
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token is required', 401);
    }

    // Verify refresh token
    const decoded = JWTUtil.verifyRefreshToken(refreshToken);

    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new tokens
    const tokens = JWTUtil.generateTokenPair((user._id?.toString() || user.id) as string, user.email);

    // Replace old refresh token with new one
    await user.removeRefreshToken(refreshToken);
    await user.addRefreshToken(tokens.refreshToken);

    const response: ApiResponse<{ tokens: typeof tokens }> = {
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens }
    };

    // Set new refresh token in httpOnly cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json(response);
  });

  /**
   * Logout user
   */
  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const refreshToken = req.body.refreshToken || req.cookies.refreshToken;

    if (refreshToken && req.user) {
      const user = await User.findById(req.user._id).select('+refreshTokens');
      if (user) {
        await user.removeRefreshToken(refreshToken);
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully'
    };

    res.status(200).json(response);
  });

  /**
   * Logout from all devices
   */
  static logoutAll = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const user = await User.findById(req.user._id).select('+refreshTokens');
    if (user) {
      user.refreshTokens = [];
      await user.save();
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    const response: ApiResponse = {
      success: true,
      message: 'Logged out from all devices successfully'
    };

    res.status(200).json(response);
  });

  /**
   * Get current user profile
   */
  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const response: ApiResponse<IUserResponse> = {
      success: true,
      message: 'Profile retrieved successfully',
      data: req.user
    };

    res.status(200).json(response);
  });

  /**
   * Update user profile
   */
  static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const updateData: IUpdateProfile = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const userResponse = user.toJSON() as unknown as IUserResponse;

    const response: ApiResponse<IUserResponse> = {
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    };

    res.status(200).json(response);
  });

  /**
   * Change password
   */
  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const { currentPassword, newPassword }: IChangePassword = req.body;

    // Find user with password
    const user = await User.findById(req.user._id).select('+password +refreshTokens');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Invalidate all refresh tokens (logout from all devices)
    user.refreshTokens = [];
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Password changed successfully. Please login again.'
    };

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json(response);
  });

  /**
   * Request password reset
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email }: IPasswordResetRequest = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal that user doesn't exist
      const response: ApiResponse = {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      };
      res.status(200).json(response);
      return;
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // TODO: Send password reset email
    console.log(`Password reset token for ${email}: ${resetToken}`);

    const response: ApiResponse = {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    };

    res.status(200).json(response);
  });

  /**
   * Reset password
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword }: IPasswordReset = req.body;

    // Find user by reset token
    const user = await (User as any).findByPasswordResetToken(token);
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokens = []; // Logout from all devices
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    };

    res.status(200).json(response);
  });

  /**
   * Verify email
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;

    // Find user by verification token
    const user = await (User as any).findByEmailVerificationToken(token);
    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    // Update email verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Email verified successfully'
    };

    res.status(200).json(response);
  });

  /**
   * Resend email verification
   */
  static resendEmailVerification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email is already verified', 400);
    }

    // Generate new verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // TODO: Send verification email
    console.log(`Email verification token for ${user.email}: ${verificationToken}`);

    const response: ApiResponse = {
      success: true,
      message: 'Verification email sent successfully'
    };

    res.status(200).json(response);
  });
}