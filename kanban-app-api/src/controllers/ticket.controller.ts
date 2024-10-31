import { Request, Response } from "express";

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
    res.status(200).send("Get all the tickets");
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
