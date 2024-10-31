import express, { Express, NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/v1/auth.route";
import boardRoutes from "./routes/v1/board.route";
import columnRoutes from "./routes/v1/column.route";
import ticketRoutes from "./routes/v1/ticket.route";
import taskRoutes from "./routes/v1/task.route";
import { authMiddleware } from "./middleware/auth.middleware";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(req.path);

  if (
    req.path === "/api/v1/auth/login" ||
    req.path === "/api/v1/auth/register"
  ) {
    return next();
  }

  authMiddleware(req, res, next);
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/board", boardRoutes);
app.use("/api/v1/column", columnRoutes);
app.use("/api/v1/ticket", ticketRoutes);
app.use("/api/v1/task", taskRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
});
