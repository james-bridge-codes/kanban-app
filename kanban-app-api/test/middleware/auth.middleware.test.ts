import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../../src/middleware/auth.middleware";

describe("Auth Middleware", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFunction: NextFunction;
  const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: undefined,
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    nextFunction = vi.fn();

    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should return 401 when no authorization header is present", async () => {
    await authMiddleware(mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication required",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 when authorization header does not contain a token", async () => {
    mockReq.headers = { authorization: "Bearer " };

    await authMiddleware(mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication required",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should return 401 when token is invalid", async () => {
    mockReq.headers = { authorization: "Bearer invalid_token" };

    await authMiddleware(mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should set user and call next() when token is valid", async () => {
    const userId = 123;
    const token = jwt.sign({ id: userId }, JWT_SECRET);
    mockReq.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(mockReq as Request, mockRes as Response, nextFunction);

    expect(mockReq.user).toEqual({ id: userId });
    expect(nextFunction).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });

  it("should handle malformed authorization header", async () => {
    mockReq.headers = { authorization: "malformed_header" };

    await authMiddleware(mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication required",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it("should handle expired tokens", async () => {
    const token = jwt.sign({ id: 123 }, JWT_SECRET, { expiresIn: "0s" });
    mockReq.headers = { authorization: `Bearer ${token}` };

    await authMiddleware(mockReq as Request, mockRes as Response, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid token",
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });
});
