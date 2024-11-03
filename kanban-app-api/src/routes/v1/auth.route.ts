import { Router } from "express";
import authRoutes from "../../controllers/auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

// Open Routes
router.post("/login", authRoutes.login);
router.post("/register", authRoutes.register);

// Protected Routes
router.get("/", authMiddleware, authRoutes.getCurrentUser);
router.get("/test", authMiddleware, (req, res) => {
  res.json({
    message: "If you see this, you are authenticated!",
    userId: req.user?.id,
  });
});

export default router;
