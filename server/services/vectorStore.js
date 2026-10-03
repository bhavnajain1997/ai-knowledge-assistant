import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { cosineSimilarity } from "../utils/similarity.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_FILE = path.join(__dirname, "..", "data", "store", "vectorstore.json");

/**
 * Shape:
 * {
 *   documents: {
 *     [docId]: { id, name, uploadedAt, pageCount, charCount, fullText }
 *   },
 *   chunks: [
 *     { id, docId, documentName, chunkIndex, content, embedding: number[] }
 *   ]
 * }
 *
 * Kept in memory for fast search, persisted to disk so uploads survive restarts.
 */
let store = { documents: {}, chunks: [] };

export async function loadStore() {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf-8");
    store = JSON.parse(raw);
  } catch {
    store = { documents: {}, chunks: [] };
    await persist();
  }
  return store;
}

async function persist() {
  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2));
}

export async function addDocument(doc) {
  store.documents[doc.id] = doc;
  await persist();
}

export async function addChunks(chunks) {
  store.chunks.push(...chunks);
  await persist();
}

export function listDocuments() {
  return Object.values(store.documents).map(({ fullText, ...meta }) => meta);
}

export function getDocument(docId) {
  return store.documents[docId];
}

export async function deleteDocument(docId) {
  delete store.documents[docId];
  store.chunks = store.chunks.filter((c) => c.docId !== docId);
  await persist();
}

/**
 * Returns the top-K most similar chunks to a query embedding, optionally
 * scoped to a specific set of document ids.
 */
export function search(queryEmbedding, topK = 5, docIds = null) {
  const pool = docIds
    ? store.chunks.filter((c) => docIds.includes(c.docId))
    : store.chunks;

  const scored = pool.map((c) => ({
    ...c,
    score: cosineSimilarity(queryEmbedding, c.embedding),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK);
}

export function hasAnyDocuments() {
  return Object.keys(store.documents).length > 0;
}
