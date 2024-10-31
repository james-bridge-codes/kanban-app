import { Express, Router } from "express";
import ticketController from "../../controllers/ticket.controller";

const router = Router();

// GET TICKETS
router.get("/", ticketController.getAllTickets);
router.get("/:id", ticketController.getTicketByID);

// CREATE TICKETS
router.post("/", ticketController.createTicket);

// UPDATE TICKETS
router.put("/:id", ticketController.updateTicket);

// DELETE TICKETS
router.put("/soft-delete/:id", ticketController.softDeleteTicket);
router.delete("/hard-delete/:id", ticketController.hardDeleteTicket);

export default router;
