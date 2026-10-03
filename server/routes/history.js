import { Router } from "express";
import {
  listSessions,
  getSession,
  createSession,
  renameSession,
  deleteSession,
} from "../controllers/historyController.js";

const router = Router();

router.get("/", listSessions);
router.post("/", createSession);
router.get("/:sessionId", getSession);
router.put("/:sessionId", renameSession);
router.delete("/:sessionId", deleteSession);

export default router;
