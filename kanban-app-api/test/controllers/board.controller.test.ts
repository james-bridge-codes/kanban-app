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
      create: vi.fn(),
      update: vi.fn(),
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

  it("should return 500 when the database query fails", async () => {
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

    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.board.findUnique).mockRejectedValue(mockError);

    await boardController.getBoardByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in board controller",
      error: "Database connection failed",
    });
  });
});

describe("Board Controller - create", () => {
  it("should return 401 if the user is not authenticated", async () => {
    const mockReq = {
      user: undefined,
      params: {},
      body: {
        title: "New Board",
      },
      query: {},
    } as Partial<Request> as Request;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as Partial<Response>;

    await boardController.createBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication failed",
    });
  });

  it("should return 400 if no title is provided", async () => {
    const mockReq = {
      user: { id: "test-user-id" },
      params: {},
      body: {
        title: "",
      },
      query: {},
    } as Partial<Request> as Request;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as Partial<Response>;

    await boardController.createBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "No title provided",
    });
  });

  it("should create a new board when user is authenticated and title is provided", async () => {
    const mockReq = {
      user: { id: "test-user-id" },
      params: {},
      body: {
        title: "My New Board",
      },
      query: {},
    } as Partial<Request> as Request;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as Partial<Response>;

    const mockCreatedBoard = {
      id: "new-board-123",
      title: "My New Board",
      userId: "test-user-id",
      isDeleted: false,
      columns: [],
    };

    vi.mocked(prisma.board.create).mockResolvedValue(mockCreatedBoard);

    await boardController.createBoard(mockReq, mockRes as Response);

    expect(prisma.board.create).toHaveBeenCalledWith({
      data: {
        title: "My New Board",
        isDeleted: false,
        userId: "test-user-id",
      },
      select: {
        title: true,
        columns: true,
        id: true,
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(mockCreatedBoard);
  });

  it("should return 500 when database creation fails", async () => {
    const mockReq = {
      user: { id: "test-user-id" },
      params: {},
      body: {
        title: "My New Board",
      },
      query: {},
    } as Partial<Request> as Request;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as Partial<Response>;

    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.board.create).mockRejectedValue(mockError);

    await boardController.createBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to create new board",
      error: "Database connection failed",
    });
  });
});

describe("Board Controller - updated", () => {
  it("shows a 401 error when user is not authenticated", async () => {
    const mockReq = {
      user: undefined,
      params: {},
      body: { title: "a new title" },
      query: {},
    } as Request;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as Partial<Response>;

    await boardController.updateBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication failed",
    });
  });

  it("shows a 400 error if no title is provided", async () => {
    const mockReq = {
      user: { id: "test-user" },
      params: {},
      body: { title: "" },
      query: {},
    } as Request;

    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as Partial<Response>;

    await boardController.updateBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "No title provided" });
  });
});
