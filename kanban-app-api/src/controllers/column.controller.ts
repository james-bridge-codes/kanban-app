import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface ColumnController {
  getAllColumns: (req: Request, res: Response) => Promise<void>;
  getColumnByID: (req: Request, res: Response) => Promise<void>;
  createColumn: (req: Request, res: Response) => Promise<void>;
  updateColumn: (req: Request, res: Response) => Promise<void>;
  softDeleteColumn: (req: Request, res: Response) => Promise<void>;
  hardDeleteColumn: (req: Request, res: Response) => Promise<void>;
}

const columnController: ColumnController = {
  getAllColumns: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "User not authenticated" });
      }

      const { boardId } = req.body;

      if (!boardId) {
        res.status(400).json({ message: "Board ID missing" });
      }

      const result = await prisma.column.findMany({
        where: {
          boardId: boardId,
          isDeleted: false,
        },
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Error in column controller",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  getColumnByID: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "User not authenticated" });
      }

      const { boardId } = req.body;

      if (!boardId) {
        res.status(400).json({ message: "Board ID missing" });
      }

      const { id: columnId } = req.params;

      if (!columnId) {
        res.status(400).json({ message: "Column ID missing" });
      }

      const result = await prisma.column.findUnique({
        where: {
          id: columnId,
          isDeleted: false,
        },
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Error in column controller",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  createColumn: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Creating a new column");
  },

  updateColumn: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Updating a column");
  },

  softDeleteColumn: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Soft deleting a column");
  },

  hardDeleteColumn: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Hard deleting a column");
  },
};

export default columnController;
