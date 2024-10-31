import { Express, Router } from "express";
import boardController from "../../controllers/board.controller";

const router = Router();

// GET BOARDS
router.get("/", boardController.getAllBoards);
router.get("/:id", boardController.getBoardByID);

// CREATE BOARDS
router.post("/", boardController.createBoard);

// UPDATE BOARDS
router.put("/:id", boardController.updateBoard);

// DELETE BOARDS
router.put("/soft-delete/:id", boardController.softDeteleBoard);
router.delete("/hard-delete/:id", boardController.hardDeleteBoard);

export default router;
