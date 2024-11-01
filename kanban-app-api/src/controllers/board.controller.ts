import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

interface BoardController {
  getAllBoards: (req: Request, res: Response) => Promise<void>;
  getBoardByID: (req: Request, res: Response) => Promise<void>;
  createBoard: (req: Request, res: Response) => Promise<void>;
  updateBoard: (req: Request, res: Response) => Promise<void>;
  softDeteleBoard: (req: Request, res: Response) => Promise<void>;
  hardDeleteBoard: (req: Request, res: Response) => Promise<void>;
}

const boardController: BoardController = {
  getAllBoards: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.send(401).json({ message: "Authentication failed" });
        return;
      }

      const id = user.id;

      const result = await prisma.board.findMany({
        where: {
          userId: id,
          isDeleted: false,
        },
      });

      if (!result || result.length < 1) {
        res.status(404).json({ error: "Boards not found" });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Error in board controller",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  getBoardByID: async (req: Request, res: Response): Promise<void> => {
    try {
      const { id: boardId } = req.params;
      const user = req.user;

      if (!user) {
        res.send(401).json({ message: "Authentication failed" });
        return;
      }

      const userId = user.id;

      const result = await prisma.board.findUnique({
        where: {
          id: boardId,
          userId: userId,
        },
      });

      if (!result) {
        res.status(404).json({ error: "Board not found" });
      }

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Error in board controller",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  createBoard: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({ message: "Authentication failed" });
        return;
      }

      const userId = user.id;
      const { title } = req.body;

      if (title === undefined || title.length < 1) {
        console.log("Short title");
        res.status(400).json({ message: "No title provided" });
        return;
      }

      const result = await prisma.board.create({
        data: {
          title: title,
          isDeleted: false,
          userId: userId,
        },
        select: {
          title: true,
          columns: true,
          id: true,
        },
      });

      console.log("about to send new board back", result);

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to create new board",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  updateBoard: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.send(401).json({ message: "Authentication failed" });
        return;
      }

      const { id: boardId } = req.params;
      const userId = user.id;
      const { title } = req.body;

      const result = await prisma.board.update({
        where: {
          id: boardId,
          userId: userId,
        },
        data: {
          title: title.trim(),
        },
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Failed to create new board",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  softDeteleBoard: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.send(401).json({ message: "Authentication failed" });
        return;
      }

      const { id: boardId } = req.params;
      const userId = user.id;

      await prisma.board.update({
        where: {
          id: boardId,
          userId: userId,
        },
        data: {
          isDeleted: true,
        },
      });

      res.status(200).json({ message: "Board successfully soft-deleted" });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create new board",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },

  hardDeleteBoard: async (req: Request, res: Response): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        res.send(401).json({ message: "Authentication failed" });
        return;
      }

      const { id: boardId } = req.params;
      const userId = user.id;

      await prisma.board.delete({
        where: {
          userId: userId,
          id: boardId,
        },
      });

      res.status(204).json({ message: "Board successfully deleted" });
    } catch (error) {
      res.status(500).json({
        message: "Failed to create new board",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};

export default boardController;
