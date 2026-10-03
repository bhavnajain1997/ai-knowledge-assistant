/**
 * Splits raw text into overlapping chunks, trying to break on sentence/paragraph
 * boundaries so chunks stay semantically coherent for embeddings.
 */
export function chunkText(text, chunkSize = 1000, overlap = 150) {
  const clean = text.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();

  if (!clean) return [];

  // Split into sentences (naive but effective for most prose/notes).
  const sentences = clean
    .split(/(?<=[.?!\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > chunkSize && current) {
      chunks.push(current.trim());
      // Start next chunk with overlap from the end of the previous chunk.
      const overlapText = current.slice(Math.max(0, current.length - overlap));
      current = overlapText + " " + sentence;
    } else {
      current = (current + " " + sentence).trim();
    }
  }

  if (current.trim()) chunks.push(current.trim());

  return chunks.map((content, index) => ({
    index,
    content,
    charCount: content.length,
  }));
}
