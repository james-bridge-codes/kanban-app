import { Express, Router } from "express";
import boardController from "../../controllers/board.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// GET BOARDS
router.get("/", authMiddleware, boardController.getAllBoards);
router.get("/:id", boardController.getBoardByID);

// CREATE BOARDS
router.post("/", boardController.createBoard);

// UPDATE BOARDS
router.put("/:id", boardController.updateBoard);

// DELETE BOARDS
router.put("/soft-delete/:id", boardController.softDeteleBoard);
router.delete("/hard-delete/:id", boardController.hardDeleteBoard);

export default router;
