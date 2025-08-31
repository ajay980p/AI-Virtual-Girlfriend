import { Request } from 'express';
import { IUserResponse } from './user.types';

export interface AuthenticatedRequest extends Request {
  user?: IUserResponse;
}