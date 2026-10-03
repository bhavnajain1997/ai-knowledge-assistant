import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_FILE = path.join(__dirname, "..", "data", "store", "chatHistory.json");

/**
 * Shape:
 * {
 *   sessions: {
 *     [sessionId]: {
 *       id, title, createdAt, updatedAt,
 *       messages: [{ id, role, content, citations?, groundedInDocuments?, createdAt }]
 *     }
 *   }
 * }
 *
 * Kept in memory for fast reads, persisted to disk after every write so
 * conversations survive server restarts.
 */
let store = { sessions: {} };

export async function loadHistoryStore() {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    store = JSON.parse(raw);
  } catch {
    store = { sessions: {} };
    await persist();
  }
  return store;
}

async function persist() {
  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2));
}

function titleFromText(text) {
  const clean = text.trim().replace(/\s+/g, " ");
  return clean.length > 60 ? clean.slice(0, 57) + "…" : clean;
}

export function listSessions() {
  return Object.values(store.sessions)
    .map((s) => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      messageCount: s.messages.length,
      preview: s.messages[0]?.content?.slice(0, 80) || "",
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getSession(sessionId) {
  return store.sessions[sessionId] || null;
}

export async function createSession(firstMessageText) {
  const id = nanoid(12);
  const now = new Date().toISOString();
  store.sessions[id] = {
    id,
    title: firstMessageText ? titleFromText(firstMessageText) : "New conversation",
    createdAt: now,
    updatedAt: now,
    messages: [],
  };
  await persist();
  return store.sessions[id];
}

export async function appendMessages(sessionId, newMessages) {
  const session = store.sessions[sessionId];
  if (!session) throw new Error("Chat session not found.");

  const now = new Date().toISOString();
  for (const m of newMessages) {
    session.messages.push({ id: nanoid(8), createdAt: now, ...m });
  }
  session.updatedAt = now;

  if (session.title === "New conversation") {
    const firstUserMsg = session.messages.find((m) => m.role === "user");
    if (firstUserMsg) session.title = titleFromText(firstUserMsg.content);
  }

  await persist();
  return session;
}

export async function renameSession(sessionId, title) {
  const session = store.sessions[sessionId];
  if (!session) throw new Error("Chat session not found.");
  session.title = titleFromText(title);
  session.updatedAt = new Date().toISOString();
  await persist();
  return session;
}

export async function deleteSession(sessionId) {
  delete store.sessions[sessionId];
  await persist();
}
