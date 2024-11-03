import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Request, Response } from "express";
import authController from "../../src/controllers/auth.controller";
import { prisma } from "../../src/lib/prisma";
import { UserPayload, UserResponse } from "../../src/types/auth.types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createToken } from "../../src/services/authService";
import { create } from "domain";

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock("../../src/services/authService", () => ({
  createToken: vi.fn().mockImplementation(() => "mock.jwt.token"),
}));

let authenticatedUserId: string;
let mockReq: Request;
let mockRes: Partial<Response>;
let mockUser: UserResponse;

beforeEach(() => {
  vi.clearAllMocks();

  authenticatedUserId = "test-user-id";

  mockReq = {
    user: { id: authenticatedUserId },
    params: {},
    body: { email: "user@email.com", password: "123ABC" },
    query: {},
  } as Request;

  mockRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as Partial<Response>;

  mockUser = {
    id: authenticatedUserId,
    email: "user@email.com",
    name: "user name",
  };
});

describe("GET /auth", () => {
  it("should return 401 if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await authController.getCurrentUser(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Not authenticated",
    });
  });

  it("should return a 404 error if prisma fails to find a matching user", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await authController.getCurrentUser(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User not found",
    });
  });

  it("should return a 500 error if the prisma query fails", async () => {
    const mockError = new Error("Error fetching user");
    vi.mocked(prisma.user.findUnique).mockRejectedValue(mockError);

    await authController.getCurrentUser(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error fetching user",
    });
  });

  it("should return the user details when the user is logged in", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any);

    await authController.getCurrentUser(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockUser);
  });
});

describe("POST /auth/login", () => {
  it("should return a 401 if no user exists", async () => {
    mockReq.user = undefined;

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await authController.login(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid credentials",
    });
  });

  it("should return a 401 if password is not valid", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      email: "",
      password: "",
      name: "",
      id: "",
    });

    vi.mocked(bcrypt.compare).mockImplementationOnce(() =>
      Promise.resolve(false)
    );

    await authController.login(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid credentials",
    });
  });

  it("should return a valid jwt token including user data", async () => {
    const mockUser = {
      id: authenticatedUserId,
      email: "test@example.com",
      password: "hashedPassword",
      name: "Test User",
    };

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

    vi.mocked(bcrypt.compare).mockImplementationOnce(() =>
      Promise.resolve(true)
    );

    await authController.login(mockReq, mockRes as Response);

    expect(bcrypt.compare).toHaveBeenCalledWith("123ABC", mockUser.password);
    expect(createToken).toHaveBeenCalledWith(mockUser.id);
    expect(mockRes.json).toHaveBeenCalledWith({
      user: {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
      },
      token: "mock.jwt.token",
    });
  });
});

describe("POST /auth/register", () => {
  it("is a placeholder", () => {});
});
