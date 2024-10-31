// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UserPayload } from "../types/auth.types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
