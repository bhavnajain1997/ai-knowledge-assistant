import { generateSummary } from "../services/geminiService.js";
import * as vectorStore from "../services/vectorStore.js";

export async function summarizeDocument(req, res, next) {
  try {
    const { docId } = req.params;
    const doc = vectorStore.getDocument(docId);

    if (!doc) return res.status(404).json({ error: "Document not found." });

    const summary = await generateSummary(doc.fullText, doc.name);
    res.json({ docId, documentName: doc.name, summary });
  } catch (err) {
    next(err);
  }
}
