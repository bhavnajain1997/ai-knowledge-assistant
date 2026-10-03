import { Router } from "express";
import { summarizeDocument } from "../controllers/summaryController.js";

const router = Router();

router.get("/:docId", summarizeDocument);

export default router;
