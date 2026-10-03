import { genAI, CHAT_MODEL, EMBEDDING_MODEL } from "../config/gemini.js";

const embeddingModel = () => genAI.getGenerativeModel({ model: EMBEDDING_MODEL });
const chatModel = () => genAI.getGenerativeModel({ model: CHAT_MODEL });

/**
 * Embeds a single piece of text. taskType lets Gemini optimize the vector
 * for either indexing document chunks or embedding a search query.
 */
export async function embedText(text, taskType = "RETRIEVAL_DOCUMENT") {
  const model = embeddingModel();
  const result = await model.embedContent({
    content: { role: "user", parts: [{ text }] },
    taskType,
  });
  return result.embedding.values;
}

/**
 * Embeds many chunks with limited concurrency to stay within rate limits.
 */
export async function embedBatch(texts, taskType = "RETRIEVAL_DOCUMENT", concurrency = 5) {
  const results = new Array(texts.length);
  let cursor = 0;

  async function worker() {
    while (cursor < texts.length) {
      const i = cursor++;
      results[i] = await embedText(texts[i], taskType);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, texts.length) }, worker);
  await Promise.all(workers);
  return results;
}

/**
 * Answers a question. If context chunks are provided, instructs Gemini to
 * ground its answer strictly in them (RAG mode). Otherwise, answers from
 * general knowledge (fallback mode) and says so.
 */
export async function generateAnswer({ question, contextChunks, history = [] }) {
  const model = chatModel();

  const hasContext = contextChunks && contextChunks.length > 0;

  const historyText = history
    .slice(-6)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  let prompt;

  if (hasContext) {
    const contextBlock = contextChunks
      .map(
        (c, i) =>
          `[Source ${i + 1} | ${c.documentName} | chunk ${c.chunkIndex}]\n${c.content}`
      )
      .join("\n\n---\n\n");

    prompt = `You are a helpful knowledge assistant. Answer the user's question using ONLY the context excerpts below whenever they contain the answer. If the context only partially answers the question, use what's relevant and clearly note what's missing. Cite sources inline using the format [Source N] matching the excerpt numbers.

If the context excerpts genuinely do not contain information relevant to the question, say so explicitly in one short sentence, then you may answer from general knowledge, clearly labelling that part as "General knowledge (not from your documents)".

${historyText ? `Conversation so far:\n${historyText}\n` : ""}
Context excerpts:
${contextBlock}

Question: ${question}

Answer:`;
  } else {
    prompt = `You are a helpful knowledge assistant. No relevant document context was found for this question, so answer using your general knowledge. Be clear, concise, and accurate. Mention at the start that this answer is not based on the user's uploaded documents.

${historyText ? `Conversation so far:\n${historyText}\n` : ""}
Question: ${question}

Answer:`;
  }

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Summarizes a document's full text. Uses map-reduce for very long docs so
 * the request stays within context limits.
 */
export async function generateSummary(fullText, documentName) {
  const model = chatModel();
  const MAX_DIRECT_CHARS = 30000;

  if (fullText.length <= MAX_DIRECT_CHARS) {
    const prompt = `Summarize the following document titled "${documentName}" for a reader who hasn't seen it.

Produce:
1. A 3-5 sentence executive summary.
2. 5-8 key bullet points covering the most important ideas.
3. Any notable definitions, numbers, or conclusions worth remembering.

Document:
${fullText}`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  // Map step: summarize chunks of ~25k chars each.
  const parts = [];
  for (let i = 0; i < fullText.length; i += MAX_DIRECT_CHARS) {
    parts.push(fullText.slice(i, i + MAX_DIRECT_CHARS));
  }

  const partialSummaries = [];
  for (const part of parts) {
    const result = await model.generateContent(
      `Summarize this excerpt from "${documentName}" in 4-6 bullet points, preserving key facts and numbers:\n\n${part}`
    );
    partialSummaries.push(result.response.text());
  }

  // Reduce step.
  const reducePrompt = `Combine these partial summaries of "${documentName}" into one cohesive summary with:
1. A 3-5 sentence executive summary.
2. 6-10 key bullet points.
3. Notable definitions, numbers, or conclusions.

Partial summaries:
${partialSummaries.join("\n\n")}`;

  const finalResult = await model.generateContent(reducePrompt);
  return finalResult.response.text();
}

/**
 * Generates a structured multiple-choice quiz from document text.
 */
export async function generateQuiz(fullText, documentName, numQuestions = 8) {
  const model = chatModel();
  const truncated = fullText.slice(0, 30000);

  const prompt = `Create a ${numQuestions}-question multiple-choice quiz based ONLY on the document titled "${documentName}" below. Test understanding of key concepts, facts, and definitions.

Return ONLY valid JSON (no markdown fences, no commentary) matching exactly this schema:
{
  "title": "string",
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0,
      "explanation": "string, 1-2 sentences explaining the correct answer"
    }
  ]
}

Document:
${truncated}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" },
  });

  const raw = result.response.text();
  try {
    return JSON.parse(raw);
  } catch (err) {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  }
}
