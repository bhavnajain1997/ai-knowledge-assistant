import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "[WARN] GEMINI_API_KEY is not set. Add it to server/.env before making requests."
  );
}

export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const CHAT_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-2.0-flash";
export const EMBEDDING_MODEL =
  process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";

export const RAG_CONFIG = {
  chunkSize: Number(process.env.CHUNK_SIZE || 1000),
  chunkOverlap: Number(process.env.CHUNK_OVERLAP || 150),
  topK: Number(process.env.TOP_K || 5),
  similarityThreshold: Number(process.env.SIMILARITY_THRESHOLD || 0.55),
};
