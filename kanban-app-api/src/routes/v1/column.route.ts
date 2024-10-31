import { Express, Router } from "express";
import columnController from "../../controllers/column.controller";

const router = Router();

// GET COLUMNS
router.get("/", columnController.getAllColumns);
router.get("/:id", columnController.getColumnByID);

// CREATE COLUMNS
router.post("/", columnController.createColumn);

// UPDATE COLUMNS
router.put("/:id", columnController.updateColumn);

// DELETE COLUMNS
router.put("/soft-delete/:id", columnController.softDeleteColumn);
router.delete("/hard-delete/:id", columnController.hardDeleteColumn);

export default router;
