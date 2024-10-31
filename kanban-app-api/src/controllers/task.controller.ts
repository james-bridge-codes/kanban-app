import { Request, Response } from "express";

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
    res.status(200).send("Get all the tasks");
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
