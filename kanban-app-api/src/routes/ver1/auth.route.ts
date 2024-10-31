import { Express, Router } from "express";
import { login } from "../../controllers/auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/login", login);

router.get("/test", authMiddleware, (req, res) => {
  res.json({
    message: "If you see this, you are authenticated!",
    userId: req.user?.id,
  });
});

export default router;
