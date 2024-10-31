import { Router } from "express";
import {
  login,
  register,
  getCurrentUser,
} from "../../controllers/auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// Open Routes
router.post("/login", login);
router.post("/register", register);

// Protected Routes
router.get("/", authMiddleware, getCurrentUser);
router.get("/test", authMiddleware, (req, res) => {
  res.json({
    message: "If you see this, you are authenticated!",
    userId: req.user?.id,
  });
});

export default router;
