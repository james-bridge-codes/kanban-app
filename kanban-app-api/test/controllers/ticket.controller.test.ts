import { beforeEach, vi, describe, it, expect } from "vitest";
import type { Request, Response } from "express";
import { prisma } from "../../src/lib/prisma";
import { UserPayload } from "../../src/types/auth.types";
import ticketController from "../../src/controllers/ticket.controller";

vi.mock("../../src/lib/prisma", () => ({
  prisma: {
    ticket: {
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

const testTickets = [
  {
    id: "001",
    title: "ticket one",
    description: "",
    isDeleted: false,
    tasks: [],
    columnId: "001",
  },
  {
    id: "002",
    title: "ticket two",
    description: "",
    isDeleted: false,
    tasks: [],
    columnId: "001",
  },
  {
    id: "003",
    title: "ticket three",
    description: "",
    isDeleted: true,
    tasks: [],
    columnId: "001",
  },
  {
    id: "004",
    title: "ticket four",
    description: "",
    isDeleted: false,
    tasks: [],
    columnId: "002",
  },
];

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

describe("GET /ticket", () => {
  it("should give a 401 error if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await ticketController.getAllTickets(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });

  it("should give a 400 error if the column id is missing", async () => {
    mockReq.body.columnId = undefined;

    await ticketController.getAllTickets(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Column ID missing",
    });
  });

  it("should call prisma with the correct query", async () => {
    const filteredTickets = testTickets.filter(
      (ticket) => ticket.columnId === "001" && !ticket.isDeleted
    );

    vi.mocked(prisma.ticket.findMany).mockResolvedValue(filteredTickets);

    await ticketController.getAllTickets(mockReq, mockRes as Response);

    expect(prisma.ticket.findMany).toHaveBeenCalledWith({
      where: {
        columnId: "001",
        isDeleted: false,
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(filteredTickets);
  });

  it("should return 500 when database query fails", async () => {
    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.ticket.findMany).mockRejectedValue(mockError);

    await ticketController.getAllTickets(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in ticket controller",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.ticket.findMany).mockRejectedValue("string error");

    await ticketController.getAllTickets(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in ticket controller",
      error: "Unknown error",
    });
  });
});

describe("GET /ticket:id", () => {
  it("should give a 401 error if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await ticketController.getTicketByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });

  it("should give a 400 error if the ticket id is missing", async () => {
    mockReq.params.id = "";

    await ticketController.getTicketByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Ticket id missing",
    });
  });

  it("should call prisma with the correct query", async () => {
    mockReq.params.id = "001";

    vi.mocked(prisma.ticket.findUnique).mockResolvedValue(testTickets[0]);

    await ticketController.getTicketByID(mockReq, mockRes as Response);

    expect(prisma.ticket.findUnique).toHaveBeenCalledWith({
      where: {
        id: "001",
        isDeleted: false,
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(testTickets[0]);
  });

  it("should return 500 when database query fails", async () => {
    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.ticket.findUnique).mockRejectedValue(mockError);

    await ticketController.getTicketByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in ticket controller",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.ticket.findUnique).mockRejectedValue("string error");

    await ticketController.getTicketByID(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in ticket controller",
      error: "Unknown error",
    });
  });
});

describe("POST /ticket", () => {
  it("should give a 401 error if the user is not authenticated", async () => {
    mockReq.user = undefined;

    await ticketController.createTicket(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });

  it("should give a 400 error if no update data is provided", async () => {
    mockReq.body.columnId = undefined;
    mockReq.body.title = undefined;
    mockReq.body.description = undefined;

    await ticketController.updateTicket(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "No data provided for update",
    });
  });

  it("should make the correct Prisma query", async () => {
    mockReq.body.columnId = "001";
    mockReq.body.title = "new title";
    mockReq.body.description = "new description";
    mockReq.params.id = "ticketid";

    vi.mocked(prisma.ticket.update).mockResolvedValue({
      columnId: "001",
      title: "new title",
      description: "new description",
    } as any);

    await ticketController.updateTicket(mockReq, mockRes as Response);

    expect(prisma.ticket.update).toHaveBeenCalledWith({
      where: {
        id: "ticketid",
      },
      data: {
        columnId: "001",
        title: "new title",
        description: "new description",
      },
      select: {
        title: true,
        description: true,
        columnId: true,
      },
    });

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      columnId: "001",
      title: "new title",
      description: "new description",
    });
  });

  it("should return 500 when database query fails", async () => {
    const mockError = new Error("Database connection failed");
    vi.mocked(prisma.ticket.create).mockRejectedValue(mockError);

    await ticketController.createTicket(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in ticket controller",
      error: "Database connection failed",
    });
  });

  it("handles non-Error objects in error response", async () => {
    mockReq.user = { id: authenticatedUserId };
    vi.mocked(prisma.ticket.create).mockRejectedValue("string error");

    await ticketController.createTicket(mockReq, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Error in ticket controller",
      error: "Unknown error",
    });
  });
});

// describe("PUT /ticket:id", () => {

// });

// describe("PUT /ticket:id/soft-delete", () => {});

// describe("DELETE /ticket:id", () => {});
