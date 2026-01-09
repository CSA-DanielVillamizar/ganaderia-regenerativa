import { Request as ExpressRequest } from 'express';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface RequestWithUser extends ExpressRequest {
  user: JwtPayload;
}
