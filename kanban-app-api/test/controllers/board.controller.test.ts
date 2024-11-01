import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Request, Response } from "express";
import boardController from "../../src/controllers/board.controller";
import { prisma } from "../../src/lib/prisma";
import { UserPayload } from "../../src/types/auth.types";

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    board: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
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

  it("should return all boards if the user is authenticated and has boards", async () => {
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

    const boards = [
      {
        id: "001",
        title: "board one",
        isDeleted: false,
        columns: [],
        userId: "test-user-id",
      },
      {
        id: "002",
        title: "board two",
        isDeleted: false,
        columns: [],
        userId: "test-user-id",
      },
    ];

    vi.mocked(prisma.board.findMany).mockResolvedValue(boards);

    await boardController.getAllBoards(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(boards);
  });

  it("should query prisma to find only boards that have the current user id", async () => {
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

    const boards = [
      {
        id: "001",
        title: "board one",
        isDeleted: false,
        columns: [],
        userId: "test-user-id",
      },
      {
        id: "002",
        title: "board two",
        isDeleted: false,
        columns: [],
        userId: "wrong-user",
      },
    ];

    vi.mocked(prisma.board.findMany).mockResolvedValue([boards[0]]);

    await boardController.getAllBoards(mockReq, mockRes as Response);

    expect(prisma.board.findMany).toHaveBeenCalledWith({
      where: {
        userId: "test-user-id",
        isDeleted: false,
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([boards[0]]);
  });

  it("should return 500 when database query fails", async () => {
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

    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.board.findMany).mockRejectedValue(mockError);

    await boardController.getAllBoards(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in board controller",
      error: "Database connection failed",
    });
  });
});

describe("Board Controller - getBoardByID", () => {
  it("should return a 401 if the user is not authenticated", async () => {
    const mockReq = {
      user: undefined,
      params: { id: "board-123" },
      body: {},
      query: {},
    } as Partial<Request> as Request;

    const mockRes = {
      send: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as Partial<Response>;

    await boardController.getBoardByID(mockReq, mockRes as Response);

    expect(mockRes.send).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication failed",
    });
  });

  it("should return 404 if the requested board does not exist", async () => {
    const mockReq = {
      user: { id: "test-user-id" },
      params: { id: "non-existent-board" },
      body: {},
      query: {},
    } as Partial<Request> as Request;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as Partial<Response>;

    vi.mocked(prisma.board.findUnique).mockResolvedValue(null);

    await boardController.getBoardByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Board not found",
    });
  });

  it("should return the requested board if the user is auth and the board exists", async () => {
    const mockReq = {
      user: { id: "test-user-id" },
      params: { id: "001" },
      body: {},
      query: {},
    } as Partial<Request> as Request;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as Partial<Response>;

    const boards = [
      {
        id: "001",
        title: "board one",
        isDeleted: false,
        columns: [],
        userId: "test-user-id",
      },
      {
        id: "002",
        title: "board two",
        isDeleted: false,
        columns: [],
        userId: "test-user-id",
      },
    ];

    vi.mocked(prisma.board.findUnique).mockResolvedValue(boards[0]);

    await boardController.getBoardByID(mockReq, mockRes as Response);

    expect(prisma.board.findUnique).toHaveBeenCalledWith({
      where: {
        id: "001",
        userId: "test-user-id",
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(boards[0]);
  });
});
