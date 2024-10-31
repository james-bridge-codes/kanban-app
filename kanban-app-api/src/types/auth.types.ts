import { Request } from "express";

export interface AuthRequest extends Request {
  user?: UserPayload;
}

export interface UserPayload {
  id: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
}
