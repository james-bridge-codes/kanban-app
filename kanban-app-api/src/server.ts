import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/ver1/auth.route";
import boardRoutes from "./routes/ver1/board.route";
import columnRoutes from "./routes/ver1/column.route";
import ticketRoutes from "./routes/ver1/ticket.route";
import taskRoutes from "./routes/ver1/task.route";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Express is running" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/board", boardRoutes);
app.use("/api/v1/column", columnRoutes);
app.use("/api/v1/ticket", ticketRoutes);
app.use("/api/v1/task", taskRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
});
