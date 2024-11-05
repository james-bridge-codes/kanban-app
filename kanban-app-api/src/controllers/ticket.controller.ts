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
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "User not authenticated" });
      }

      const { id: ticketId } = req.params;

      if (!ticketId) {
        res.status(400).json({ message: "Ticket id missing" });
      }

      const result = await prisma.ticket.findUnique({
        where: {
          id: ticketId,
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

  createTicket: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "User not authenticated" });
      }

      const { title, description, columnId } = req.body;

      if (!title) {
        res.status(400).json({ message: "No title provided" });
      }

      if (!columnId) {
        res.status(400).json({ message: "No column id provided" });
      }

      const result = await prisma.ticket.create({
        data: {
          title: title,
          description: description ? description : "",
          isDeleted: false,
          columnId: columnId,
        },
        select: {
          title: true,
          description: true,
          columnId: true,
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

  updateTicket: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;
      const { id: ticketId } = req.params;

      if (!user) {
        res.status(401).json({ message: "User not authenticated" });
      }

      const { columnId, title, description } = req.body;

      const updateData: any = {};

      if (columnId !== undefined) updateData.columnId = columnId;
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ message: "No data provided for update" });
        return;
      }

      const result = await prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: updateData,
        select: {
          title: true,
          description: true,
          columnId: true,
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

  softDeleteTicket: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;
      const { id: ticketId } = req.params;

      if (!user) {
        res.status(401).json({ message: "User not authenticated" });
      }

      if (!ticketId) {
        res.status(400).json({ message: "No ticket id provided" });
      }

      await prisma.ticket.update({
        where: {
          id: ticketId,
        },
        data: {
          isDeleted: true,
        },
      });

      res.status(200).json({ message: "ticket deleted" });
    } catch (error) {
      res.status(500).json({
        message: "Error in ticket controller",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  hardDeleteTicket: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;
      const { id: ticketId } = req.params;

      if (!user) {
        res.status(401).json({ message: "User not authenticated" });
      }

      if (!ticketId) {
        res.status(400).json({ message: "No ticket id" });
      }

      await prisma.ticket.delete({
        where: {
          id: ticketId,
        },
      });

      res.status(204).json({ message: "ticket deleted" });
    } catch (error) {
      res.status(500).json({
        message: "Error in ticket controller",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};

export default ticketController;
