// src/controllers/auth.controller.ts
import { Request, Response, RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { LoginDTO } from "../types/auth.types";
import bcrypt from "bcrypt";

export const login: RequestHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);

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
};
