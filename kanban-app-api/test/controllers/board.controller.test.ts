import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Request, Response } from "express";
import { prisma } from "../../src/lib/prisma";
import { UserPayload } from "../../src/types/auth.types";
import boardController from "../../src/controllers/board.controller";

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    board: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

let authenticatedUserId: string;
let mockReq: Request;
let mockRes: Partial<Response>;

const testBoards = [
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
  {
    id: "003",
    title: "board three",
    isDeleted: true,
    columns: [],
    userId: "test-user-id",
  },
  {
    id: "004",
    title: "board four",
    isDeleted: false,
    columns: [],
    userId: "other-user",
  },
];

beforeEach(() => {
  vi.clearAllMocks();

  authenticatedUserId = "test-user-id";

  mockReq = {
    user: { id: authenticatedUserId },
    params: {},
    body: {},
    query: {},
  } as Request;

  mockRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as Partial<Response>;
});

describe("GET /board", () => {
  it("should return a 401 if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await boardController.getAllBoards(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication failed",
    });
  });

  it("should return a 404 if authenticated user has no boards", async () => {
    vi.mocked(prisma.board.findMany).mockResolvedValue([]);

    await boardController.getAllBoards(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({ error: "Boards not found" });
  });

  it("should return all boards if the user is authenticated and has boards", async () => {
    vi.mocked(prisma.board.findMany).mockResolvedValue(testBoards);

    await boardController.getAllBoards(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(testBoards);
  });

  it("should query prisma to find only boards that have the current user id", async () => {
    vi.mocked(prisma.board.findMany).mockResolvedValue([
      testBoards[0],
      testBoards[1],
    ]);

    await boardController.getAllBoards(mockReq, mockRes as Response);

    expect(prisma.board.findMany).toHaveBeenCalledWith({
      where: {
        userId: "test-user-id",
        isDeleted: false,
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([testBoards[0], testBoards[1]]);
  });

  it("should return 500 when database query fails", async () => {
    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.board.findMany).mockRejectedValue(mockError);

    await boardController.getAllBoards(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in board controller",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.board.findMany).mockRejectedValue("string error");

    await boardController.getAllBoards(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in board controller",
      error: "Unknown error",
    });
  });
});

describe("GET /board:id", () => {
  it("should return a 401 if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await boardController.getBoardByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication failed",
    });
  });

  it("should return 404 if the requested board does not exist", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.params = { id: "non-existent-board" };

    vi.mocked(prisma.board.findUnique).mockResolvedValue(null);

    await boardController.getBoardByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: "Board not found",
    });
  });

  it("should return the requested board if the user is auth and the board exists", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.params = { id: "001" };

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
    mockReq.user = { id: authenticatedUserId };
    mockReq.params = { id: "001" };

    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.board.findUnique).mockRejectedValue(mockError);

    await boardController.getBoardByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in board controller",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.board.findUnique).mockRejectedValue("string error");

    await boardController.getBoardByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in board controller",
      error: "Unknown error",
    });
  });
});

describe("POST /board", () => {
  it("should return 401 if the user is not authenticated", async () => {
    mockReq.user = undefined;
    mockReq.body = { title: "New Board" };

    await boardController.createBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication failed",
    });
  });

  it("should return 400 if no title is provided", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.body = { title: "" };

    await boardController.createBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "No title provided",
    });
  });

  it("should create a new board when user is authenticated and title is provided", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.body = { title: "New Board" };

    vi.mocked(prisma.board.create).mockResolvedValue(testBoards[0]);

    await boardController.createBoard(mockReq, mockRes as Response);

    expect(prisma.board.create).toHaveBeenCalledWith({
      data: {
        title: "New Board",
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
    expect(mockRes.json).toHaveBeenCalledWith(testBoards[0]);
  });

  it("should return 500 when database creation fails", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.body = { title: "New Board" };

    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.board.create).mockRejectedValue(mockError);

    await boardController.createBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to create new board",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.body = { title: "A new title" };
    vi.mocked(prisma.board.create).mockRejectedValue("string error");

    await boardController.createBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to create new board",
      error: "Unknown error",
    });
  });
});

describe("PUT /board:id", () => {
  it("shows a 401 error when user is not authenticated", async () => {
    mockReq.user = undefined;
    mockReq.body = { title: "New Title" };

    await boardController.updateBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication failed",
    });
  });

  it("shows a 400 error if no title is provided", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.body = { title: "" };

    await boardController.updateBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ message: "No title provided" });
  });

  it("updates the title of the board when a title is provided", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.body = { title: "A new title" };
    mockReq.params = { id: "001" };

    const updatedBoard = {
      ...testBoards[0],
      title: "A new title",
    };

    vi.mocked(prisma.board.update).mockResolvedValue(updatedBoard);

    await boardController.updateBoard(mockReq, mockRes as Response);

    expect(prisma.board.update).toHaveBeenCalledWith({
      where: {
        id: "001",
        userId: authenticatedUserId,
      },
      data: {
        title: "A new title",
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(updatedBoard);
  });

  it("should return 500 when database creation fails", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.body = { title: "A new title" };
    mockReq.params = { id: "001" };

    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.board.update).mockRejectedValue(mockError);

    await boardController.updateBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to update board",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.params = { id: "100" };
    mockReq.body = { title: "a new title" };

    vi.mocked(prisma.board.update).mockRejectedValue("string error");

    await boardController.updateBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to update board",
      error: "Unknown error",
    });
  });
});

describe("PUT /board:id/soft-delete", () => {
  it("returns a 401 error if the user is not authenticated", async () => {
    mockReq.user = undefined;
    mockReq.params = { id: "001" };

    await boardController.softDeteleBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication failed",
    });
  });

  it("returns a 500 error if the user tries to target a board they don't own", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.params = { id: "004" };

    vi.mocked(prisma.board.update).mockRejectedValue(
      new Error("board not found")
    );

    await boardController.softDeteleBoard(mockReq, mockRes as Response);

    expect(prisma.board.update).toHaveBeenCalledWith({
      where: {
        id: "004",
        userId: "test-user-id",
      },
      data: {
        isDeleted: true,
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to delete board",
      error: "board not found",
    });
  });

  it("allows an authenticated user to soft delete their own board", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.params = { id: "001" };

    vi.mocked(prisma.board.update).mockResolvedValue({
      id: "001",
      title: "some board",
      isDeleted: true,
      userId: "tesst-user-id",
    });

    await boardController.softDeteleBoard(mockReq, mockRes as Response);

    expect(prisma.board.update).toHaveBeenCalledWith({
      where: {
        id: "001",
        userId: "test-user-id",
      },
      data: {
        isDeleted: true,
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Board successfully soft-deleted",
    });
  });

  it("should return 500 when database creation fails", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.params = { id: "001" };

    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.board.update).mockRejectedValue(mockError);

    await boardController.softDeteleBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to delete board",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.board.update).mockRejectedValue("string error");

    await boardController.softDeteleBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to delete board",
      error: "Unknown error",
    });
  });
});

describe("DELETE /board:id", () => {
  it("returns a 401 error if the user is not authenticated", async () => {
    mockReq.user = undefined;
    mockReq.params = { id: "001" };

    await boardController.hardDeleteBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Authentication failed",
    });
  });

  it("returns a 500 error if the user tries to target a board they don't own", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.params = { id: "004" };

    vi.mocked(prisma.board.delete).mockRejectedValue(
      new Error("board not found")
    );

    await boardController.hardDeleteBoard(mockReq, mockRes as Response);

    expect(prisma.board.delete).toHaveBeenCalledWith({
      where: {
        id: "004",
        userId: "test-user-id",
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to delete board",
      error: "board not found",
    });
  });

  it("deletes the board from the database", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.params = { id: "001" };

    vi.mocked(prisma.board.delete).mockResolvedValue({
      id: "001",
      title: "some board",
      isDeleted: false,
      userId: "test-user-id",
    });

    await boardController.hardDeleteBoard(mockReq, mockRes as Response);

    expect(prisma.board.delete).toHaveBeenCalledWith({
      where: {
        id: "001",
        userId: "test-user-id",
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(204);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Board successfully deleted",
    });
  });

  it("returns a 500 error if the prisma call fails", async () => {
    mockReq.user = { id: authenticatedUserId };
    mockReq.params = { id: "001" };

    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.board.delete).mockRejectedValue(mockError);

    await boardController.hardDeleteBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to delete board",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.board.delete).mockRejectedValue("string error");

    await boardController.hardDeleteBoard(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Failed to delete board",
      error: "Unknown error",
    });
  });
});
