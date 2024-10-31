import { Request, Response } from "express";

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
    res.status(200).send("Get all the boards");
  },

  getBoardByID: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Get a board by id");
  },

  createBoard: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Creating a new board");
  },

  updateBoard: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Updating a board");
  },

  softDeteleBoard: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Soft deleting a board");
  },

  hardDeleteBoard: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Hard deleting a board");
  },
};

export default boardController;
