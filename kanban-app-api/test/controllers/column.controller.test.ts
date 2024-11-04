import { beforeEach, vi, describe, it, expect } from "vitest";
import type { Request, Response } from "express";
import { prisma } from "../../src/lib/prisma";
import { UserPayload } from "../../src/types/auth.types";
import columnController from "../../src/controllers/column.controller";

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    column: {
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

const testBoard = {
  id: "001",
  title: "board one",
  isDeleted: false,
  columns: [],
  userId: "test-user-id",
};

const testColumns = [
  {
    id: "001",
    title: "col one",
    isDeleted: false,
    tickets: [],
    boardId: "testBoard",
  },
  {
    id: "002",
    title: "col two",
    isDeleted: false,
    tickets: [],
    boardId: "testBoard",
  },
  {
    id: "003",
    title: "col three",
    isDeleted: true,
    tickets: [],
    boardId: "testBoard",
  },
  {
    id: "004",
    title: "col four",
    isDeleted: false,
    tickets: [],
    boardId: "otherBoard",
  },
];

beforeEach(() => {
  vi.clearAllMocks();

  authenticatedUserId = "test-user-id";

  mockReq = {
    user: { id: authenticatedUserId },
    params: {},
    body: { boardId: "001" },
    query: {},
  } as Request;

  mockRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as Partial<Response>;
});

describe("GET /column", () => {
  it("should give a 401 error if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await columnController.getAllColumns(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });

  it("should give a 400 error if the board id is missing", async () => {
    mockReq.body.boardId = undefined;

    await columnController.getAllColumns(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Board ID missing",
    });
  });

  it("should call prisma with the correct query", async () => {
    const filteredColumns = testColumns.filter(
      (col) => col.boardId === "001" && !col.isDeleted
    );

    vi.mocked(prisma.column.findMany).mockResolvedValue(filteredColumns);

    await columnController.getAllColumns(mockReq, mockRes as Response);

    expect(prisma.column.findMany).toHaveBeenCalledWith({
      where: {
        boardId: "001",
        isDeleted: false,
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(filteredColumns);
  });

  it("should return 500 when database query fails", async () => {
    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.column.findMany).mockRejectedValue(mockError);

    await columnController.getAllColumns(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in column controller",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.column.findMany).mockRejectedValue("string error");

    await columnController.getAllColumns(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in column controller",
      error: "Unknown error",
    });
  });
});

describe("GET /column:id", () => {
  it("should give a 401 error if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await columnController.getColumnByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });

  it("should give a 400 error if the board id is missing", async () => {
    mockReq.body.boardId = undefined;

    await columnController.getColumnByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Board ID missing",
    });
  });

  it("should give a 400 error if the column id is missing", async () => {
    mockReq.body.boardId = undefined;

    await columnController.getColumnByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Column ID missing",
    });
  });

  it("should call prisma with the correct query", async () => {
    mockReq.params.id = "001";

    vi.mocked(prisma.column.findUnique).mockResolvedValue(testColumns[0]);

    await columnController.getColumnByID(mockReq, mockRes as Response);

    expect(prisma.column.findUnique).toHaveBeenCalledWith({
      where: {
        id: "001",
        isDeleted: false,
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(testColumns[0]);
  });

  it("should return 500 when database query fails", async () => {
    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.column.findUnique).mockRejectedValue(mockError);

    await columnController.getAllColumns(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in column controller",
      error: "Unknown error",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.column.findUnique).mockRejectedValue("string error");

    await columnController.getAllColumns(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in column controller",
      error: "Unknown error",
    });
  });
});

describe("POST /column", () => {
  it("should give a 401 error if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await columnController.createColumn(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });

  it("should give a 400 error if the board id is missing", async () => {
    mockReq.body.boardId = undefined;

    await columnController.createColumn(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Board id missing",
    });
  });

  it("should give a 400 error if the column name is missing", async () => {
    mockReq.body.boardId = "001";
    mockReq.body.columnName = undefined;

    await columnController.createColumn(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "column name missing",
    });
  });

  it("should call prisma with the correct query", async () => {
    mockReq.body.boardId = "001";
    mockReq.body.columnName = "new col";

    vi.mocked(prisma.column.create).mockResolvedValue(testColumns[0]);

    await columnController.createColumn(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(testColumns[0]);
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.column.create).mockRejectedValue("string error");

    await columnController.getAllColumns(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in column controller",
      error: "Unknown error",
    });
  });
});

describe("PUT /column:id", () => {
  it("should give a 401 error if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await columnController.updateColumn(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });

  it("should give a 400 error if the column id is missing", async () => {
    await columnController.updateColumn(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Column ID missing",
    });
  });

  it("should give a 400 error if the title is missing", async () => {
    mockReq.params.id = "001";
    mockReq.body.title = undefined;

    await columnController.updateColumn(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "New title missing",
    });
  });

  it("should call Prisma with the correct query ", async () => {
    vi.mocked(prisma.column.update).mockResolvedValue({
      title: "old title",
      id: "001",
      isDeleted: false,
      boardId: "some board",
    });

    mockReq.body.title = "new title";
    mockReq.params.id = "001";

    await columnController.updateColumn(mockReq, mockRes as Response);

    expect(prisma.column.update).toHaveBeenCalledWith({
      where: {
        id: "001",
      },
      data: {
        title: "new title",
      },
      select: {
        title: true,
        tickets: true,
        id: true,
      },
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.column.update).mockRejectedValue("string error");

    await columnController.getAllColumns(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in column controller",
      error: "Unknown error",
    });
  });
});

describe("PUT /column:id/soft-delete", () => {
  it("is a placeholder", () => {});
});

describe("DELETE /column:id", () => {
  it("is a placeholder", () => {});
});
