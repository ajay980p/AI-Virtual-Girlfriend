export interface IUser {
  _id?: any;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  refreshTokens: string[];
  avatar?: string;
  preferences: {
    avatarId?: string;
    personalityTraits?: string[];
    communicationStyle?: string;
  };
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IUserResponse {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  avatar?: string;
  preferences: {
    avatarId?: string;
    personalityTraits?: string[];
    communicationStyle?: string;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthResponse {
  user: IUserResponse;
  tokens: IAuthTokens;
}

export interface IJWTPayload {
  userId: string;
  email: string;
  type?: string;
}

export interface IPasswordResetRequest {
  email: string;
}

export interface IPasswordReset {
  token: string;
  newPassword: string;
}

export interface IEmailVerification {
  token: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface IUpdateProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  preferences?: {
    avatarId?: string;
    personalityTraits?: string[];
    communicationStyle?: string;
  };
}