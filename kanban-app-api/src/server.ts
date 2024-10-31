import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import boardRoutes from "./routes/ver1/board.route";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Express is running" });
});

app.use("/api/v1/board", boardRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running on port ${port}`);
});
