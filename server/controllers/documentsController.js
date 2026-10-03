import fs from "fs/promises";
import { nanoid } from "nanoid";
import { extractText } from "../services/documentProcessor.js";
import { chunkText } from "../utils/chunker.js";
import { embedBatch } from "../services/geminiService.js";
import * as vectorStore from "../services/vectorStore.js";
import { RAG_CONFIG } from "../config/gemini.js";

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const { path: filePath, mimetype, originalname, size } = req.file;

    const { text, pageCount } = await extractText(filePath, mimetype, originalname);

    if (!text || text.trim().length < 20) {
      await fs.unlink(filePath).catch(() => {});
      return res.status(422).json({
        error: "Couldn't extract meaningful text from this file. Is it scanned/empty?",
      });
    }

    const docId = nanoid(12);
    const chunks = chunkText(text, RAG_CONFIG.chunkSize, RAG_CONFIG.chunkOverlap);

    if (chunks.length === 0) {
      return res.status(422).json({ error: "Document produced no usable chunks." });
    }

    const embeddings = await embedBatch(
      chunks.map((c) => c.content),
      "RETRIEVAL_DOCUMENT"
    );

    const document = {
      id: docId,
      name: originalname,
      uploadedAt: new Date().toISOString(),
      pageCount,
      charCount: text.length,
      chunkCount: chunks.length,
      sizeBytes: size,
      fullText: text,
    };

    await vectorStore.addDocument(document);

    const storedChunks = chunks.map((c, i) => ({
      id: `${docId}-${c.index}`,
      docId,
      documentName: originalname,
      chunkIndex: c.index,
      content: c.content,
      embedding: embeddings[i],
    }));

    await vectorStore.addChunks(storedChunks);

    const { fullText, ...meta } = document;
    res.status(201).json({ document: meta });
  } catch (err) {
    next(err);
  }
}

export function listDocuments(req, res) {
  res.json({ documents: vectorStore.listDocuments() });
}

export async function deleteDocument(req, res, next) {
  try {
    const { docId } = req.params;
    const doc = vectorStore.getDocument(docId);
    if (!doc) return res.status(404).json({ error: "Document not found." });

    await vectorStore.deleteDocument(docId);
    res.json({ message: "Document deleted.", docId });
  } catch (err) {
    next(err);
  }
}

export function getDocumentMeta(req, res) {
  const { docId } = req.params;
  const doc = vectorStore.getDocument(docId);
  if (!doc) return res.status(404).json({ error: "Document not found." });
  const { fullText, ...meta } = doc;
  res.json({ document: meta });
}
