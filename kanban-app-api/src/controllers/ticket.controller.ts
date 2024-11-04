import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface TicketController {
  getAllTickets: (req: Request, res: Response) => Promise<void>;
  getTicketByID: (req: Request, res: Response) => Promise<void>;
  createTicket: (req: Request, res: Response) => Promise<void>;
  updateTicket: (req: Request, res: Response) => Promise<void>;
  softDeleteTicket: (req: Request, res: Response) => Promise<void>;
  hardDeleteTicket: (req: Request, res: Response) => Promise<void>;
}

const ticketController: TicketController = {
  getAllTickets: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "User not authenticated" });
      }

      const { columnId } = req.body;

      if (!columnId) {
        res.status(400).json({ message: "Column ID missing" });
      }

      const result = await prisma.ticket.findMany({
        where: {
          columnId: columnId,
          isDeleted: false,
        },
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Error in ticket controller",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  getTicketByID: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Get a ticket by id");
  },

  createTicket: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Creating a new ticket");
  },

  updateTicket: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Updating a ticket");
  },

  softDeleteTicket: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Soft deleting a ticket");
  },

  hardDeleteTicket: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Hard deleting a ticket");
  },
};

export default ticketController;
