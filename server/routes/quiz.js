import { Router } from "express";
import { createQuiz } from "../controllers/quizController.js";

const router = Router();

router.get("/:docId", createQuiz);

export default router;
