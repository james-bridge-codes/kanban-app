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
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "User not authenticated" });
      }

      const { boardId } = req.body;

      if (!boardId) {
        res.status(400).json({ message: "Board id missing" });
      }

      const { columnName } = req.body;

      if (!columnName) {
        res.status(400).json({ message: "column name missing" });
      }

      const result = await prisma.column.create({
        data: {
          title: columnName,
          index: 0,
          isDeleted: false,
          boardId: boardId,
        },
        select: {
          title: true,
          index: true,
          tickets: true,
          boardId: true,
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

  updateColumn: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "User not authenticated" });
      }

      const { id: columnId } = req.params;

      if (!columnId) {
        res.status(400).json({ message: "Column ID missing" });
      }

      const { title: newTitle } = req.body;

      console.log("The title is ", newTitle);

      if (!newTitle) {
        res.status(400).json({ message: "New title missing" });
      }

      const result = await prisma.column.update({
        where: {
          id: columnId,
        },
        data: {
          title: newTitle,
        },
        select: {
          title: true,
          tickets: true,
          id: true,
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

  softDeleteColumn: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Soft deleting a column");
  },

  hardDeleteColumn: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Hard deleting a column");
  },
};

export default columnController;
