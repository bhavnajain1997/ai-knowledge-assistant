import { generateQuiz } from "../services/geminiService.js";
import * as vectorStore from "../services/vectorStore.js";

export async function createQuiz(req, res, next) {
  try {
    const { docId } = req.params;
    const numQuestions = Math.min(Math.max(Number(req.query.count) || 8, 3), 15);

    const doc = vectorStore.getDocument(docId);
    if (!doc) return res.status(404).json({ error: "Document not found." });

    const quiz = await generateQuiz(doc.fullText, doc.name, numQuestions);
    res.json({ docId, documentName: doc.name, quiz });
  } catch (err) {
    next(err);
  }
}
