import { Request, Response, RequestHandler, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { LoginDTO } from "../types/auth.types";
import bcrypt from "bcrypt";
import { createToken } from "../services/authService";

interface AuthController {
  register: (req: Request, res: Response) => Promise<void>;
  login: (req: Request, res: Response) => Promise<void>;
  getCurrentUser: (req: Request, res: Response) => Promise<void>;
}

const authController: AuthController = {
  register: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(400).json({ message: "Email already registered" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      const token = createToken(user.id);

      res.status(201).json({ user, token });
    } catch (error) {
      res.status(500).json({
        message: "Error registering user",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  login: async (req: Request, res: Response): Promise<void> => {
    // Changed return type to Promise<void>
    try {
      const { email, password } = req.body as LoginDTO;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        res.status(401).json({ message: "Invalid credentials" });
        return;
      }

      const token = createToken(user.id);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error logging in",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  getCurrentUser: async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ message: "Not authenticated" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  },
};

export default authController;
