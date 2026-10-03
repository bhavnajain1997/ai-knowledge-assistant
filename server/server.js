import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";

import documentsRoutes from "./routes/documents.js";
import chatRoutes from "./routes/chat.js";
import summaryRoutes from "./routes/summary.js";
import quizRoutes from "./routes/quiz.js";
import historyRoutes from "./routes/history.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { loadStore } from "./services/vectorStore.js";
import { loadHistoryStore } from "./services/chatHistoryStore.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

async function ensureDirs() {
  await fs.mkdir(path.join(__dirname, "data", "uploads"), { recursive: true });
  await fs.mkdir(path.join(__dirname, "data", "store"), { recursive: true });
}

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",");

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/documents", documentsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/history", historyRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  await ensureDirs();
  await loadStore();
  await loadHistoryStore();
  app.listen(PORT, () => {
    console.log(`AI Knowledge Assistant API listening on http://localhost:${PORT}`);
  });
}

start();
