import { embedText, generateAnswer } from "../services/geminiService.js";
import * as vectorStore from "../services/vectorStore.js";
import * as historyStore from "../services/chatHistoryStore.js";
import { RAG_CONFIG } from "../config/gemini.js";

export async function askQuestion(req, res, next) {
  try {
    const { question, docIds = null } = req.body;
    let { sessionId } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({ error: "Question is required." });
    }

    // Create a session on first message of a new conversation so history
    // persists across page reloads without the client managing IDs upfront.
    let session = sessionId ? historyStore.getSession(sessionId) : null;
    if (!session) {
      session = await historyStore.createSession(question);
      sessionId = session.id;
    }

    // Use the persisted session as the source of truth for conversation
    // history, rather than trusting whatever the client sends back.
    const history = session.messages.map((m) => ({ role: m.role, content: m.content }));

    let contextChunks = [];
    let usedFallback = true;

    if (vectorStore.hasAnyDocuments()) {
      const queryEmbedding = await embedText(question, "RETRIEVAL_QUERY");
      const results = vectorStore.search(queryEmbedding, RAG_CONFIG.topK, docIds);

      const relevant = results.filter((r) => r.score >= RAG_CONFIG.similarityThreshold);

      if (relevant.length > 0) {
        contextChunks = relevant;
        usedFallback = false;
      }
    }

    const answer = await generateAnswer({
      question,
      contextChunks,
      history,
    });

    const citations = contextChunks.map((c) => ({
      documentId: c.docId,
      documentName: c.documentName,
      chunkIndex: c.chunkIndex,
      snippet: c.content.slice(0, 240) + (c.content.length > 240 ? "…" : ""),
      relevanceScore: Number(c.score.toFixed(3)),
    }));

    await historyStore.appendMessages(sessionId, [
      { role: "user", content: question },
      {
        role: "assistant",
        content: answer,
        citations,
        groundedInDocuments: !usedFallback,
      },
    ]);

    res.json({
      sessionId,
      answer,
      citations,
      groundedInDocuments: !usedFallback,
    });
  } catch (err) {
    next(err);
  }
}
