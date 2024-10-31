// When a user is not auth
// When a user is auth and does not have a board
// When a user is auth and does have a board
// When there is an error

import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Request, Response } from "express";
import boardController from "../../src/controllers/board.controller";
import { prisma } from "../../src/lib/prisma";
import { UserPayload } from "../../src/types/auth.types";
import { moveCursor } from "readline";

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    board: {
      findMany: vi.fn(),
    },
  },
}));

describe("Board Controller - getAllBoards", () => {
  it("should return a 401 if the user is not authenticated", async () => {
    const mockReq = {
      user: undefined,
      params: {},
      body: {},
      query: {},
    } as Request;

    const mockRes = {
      send: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as Partial<Response>;

    await boardController.getAllBoards(mockReq, mockRes as Response);

    expect(mockRes.send).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication failed",
    });
  });

  it("should return a 404 if authenticated user has no boards", async () => {
    const mockReq = {
      user: { id: "test-user-id" },
      params: {},
      body: {},
      query: {},
    } as Request;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as Partial<Response>;

    vi.mocked(prisma.board.findMany).mockResolvedValue([]);

    await boardController.getAllBoards(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Boards not found" });
  });
});
