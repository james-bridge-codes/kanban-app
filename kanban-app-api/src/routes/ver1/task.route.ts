import { Express, Router } from "express";
import taskController from "../../controllers/task.controller";

const router = Router();

// GET TASKS
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskByID);

// CREATE TASKS
router.post("/", taskController.createTask);

// UPDATE TASKS
router.put("/:id", taskController.updateTask);

// DELETE TASKS
router.put("/soft-delete/:id", taskController.softDeleteTask);
router.delete("/hard-delete/:id", taskController.hardDeleteTask);

export default router;
