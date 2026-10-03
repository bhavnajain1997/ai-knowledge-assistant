import * as historyStore from "../services/chatHistoryStore.js";

export function listSessions(req, res) {
  res.json({ sessions: historyStore.listSessions() });
}

export function getSession(req, res) {
  const { sessionId } = req.params;
  const session = historyStore.getSession(sessionId);
  if (!session) return res.status(404).json({ error: "Chat session not found." });
  res.json({ session });
}

export async function createSession(req, res, next) {
  try {
    const { title } = req.body || {};
    const session = await historyStore.createSession(title);
    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
}

export async function renameSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { title } = req.body || {};
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required." });
    }
    const session = await historyStore.renameSession(sessionId, title);
    res.json({ session });
  } catch (err) {
    if (err.message === "Chat session not found.") {
      return res.status(404).json({ error: err.message });
    }
    next(err);
  }
}

export async function deleteSession(req, res, next) {
  try {
    const { sessionId } = req.params;
    await historyStore.deleteSession(sessionId);
    res.json({ message: "Chat session deleted.", sessionId });
  } catch (err) {
    next(err);
  }
}
