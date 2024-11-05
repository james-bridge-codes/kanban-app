import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface TaskController {
  getAllTasks: (req: Request, res: Response) => Promise<void>;
  getTaskByID: (req: Request, res: Response) => Promise<void>;
  createTask: (req: Request, res: Response) => Promise<void>;
  updateTask: (req: Request, res: Response) => Promise<void>;
  softDeleteTask: (req: Request, res: Response) => Promise<void>;
  hardDeleteTask: (req: Request, res: Response) => Promise<void>;
}

const taskController: TaskController = {
  getAllTasks: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "User not authenticated" });
      }

      const { id: ticketId } = req.body;

      if (!ticketId) {
        res.status(400).json({ message: "No ticket id provided" });
      }

      const result = await prisma.task.findMany({
        where: {
          ticketId: ticketId,
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

  getTaskByID: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Get a task by id");
  },

  createTask: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Creating a new task");
  },

  updateTask: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Updating a task");
  },

  softDeleteTask: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Soft deleting a task");
  },

  hardDeleteTask: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Hard deleting a task");
  },
};

export default taskController;
