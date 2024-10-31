import { Request, Response } from "express";

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
    res.status(200).send("Get all the columns");
  },

  getColumnByID: async (req: Request, res: Response): Promise<void> => {
    res.status(200).send("Get a column by id");
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
