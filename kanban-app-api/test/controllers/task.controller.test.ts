import { beforeEach, vi, describe, it, expect } from "vitest";
import type { Request, Response } from "express";
import { prisma } from "../../src/lib/prisma";
import { UserPayload } from "../../src/types/auth.types";
import taskController from "../../src/controllers/task.controller";

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    task: {
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

beforeEach(() => {
  vi.clearAllMocks();

  authenticatedUserId = "test-user-id";

  mockReq = {
    user: { id: authenticatedUserId },
    params: {},
    body: { columnId: "001" },
    query: {},
  } as Request;

  mockRes = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as Partial<Response>;
});

const testTasks = [
  {
    id: "001",
    title: "task one",
    completed: false,
    ticketId: "T001",
  },
  {
    id: "002",
    title: "task two",
    completed: false,
    ticketId: "T001",
  },
  {
    id: "003",
    title: "task three",
    completed: true,
    ticketId: "T003",
  },
  {
    id: "004",
    title: "task four",
    completed: false,
    ticketId: "T002",
  },
];

describe("GET /task", () => {
  it("should return a 401 error if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await taskController.getAllTasks(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });

  it("should return a 400 error if no column id is provided", async () => {
    await taskController.getAllTasks(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "No ticket id provided",
    });
  });

  it("should run the correct Prisma query", async () => {
    mockReq.body.id = "001";

    vi.mocked(prisma.task.findMany).mockResolvedValue([
      testTasks[0],
      testTasks[1],
    ]);

    await taskController.getAllTasks(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith([testTasks[0], testTasks[1]]);
  });

  it("should return 500 when database query fails", async () => {
    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.task.findMany).mockRejectedValue(mockError);

    await taskController.getAllTasks(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in ticket controller",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.task.findMany).mockRejectedValue("string error");

    await taskController.getAllTasks(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in ticket controller",
      error: "Unknown error",
    });
  });
});
describe("GET /task:id", () => {
  it("should return a 401 error if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await taskController.getTaskByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });

  it("should return a 400 error if no column id is provided", async () => {
    await taskController.getTaskByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "No task id provided",
    });
  });

  it("should run the correct Prisma query", async () => {
    mockReq.params.id = "001";

    vi.mocked(prisma.task.findUnique).mockResolvedValue(testTasks[0]);

    await taskController.getTaskByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(testTasks[0]);
  });

  it("should return 500 when database query fails", async () => {
    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.task.findUnique).mockRejectedValue(mockError);

    await taskController.getTaskByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in ticket controller",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.task.findUnique).mockRejectedValue("string error");

    await taskController.getTaskByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in ticket controller",
      error: "Unknown error",
    });
  });
});
// describe("POST /task", () => {});
// describe("PUT /task:id", () => {});
// describe("PUT /task:id/soft-delete", () => {});
// describe("DELETE /task", () => {});
