import fs from "fs/promises";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

/**
 * Extracts plain text from a file on disk based on its mime type / extension.
 */
export async function extractText(filePath, mimeType, originalName) {
  const ext = originalName.split(".").pop().toLowerCase();

  if (mimeType === "application/pdf" || ext === "pdf") {
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);
    return {
      text: data.text,
      pageCount: data.numpages,
    };
  }

  if (
    mimeType === "text/plain" ||
    ext === "txt" ||
    ext === "md" ||
    mimeType === "text/markdown"
  ) {
    const text = await fs.readFile(filePath, "utf-8");
    return { text, pageCount: null };
  }

  throw new Error(
    `Unsupported file type: ${mimeType || ext}. Please upload a PDF or .txt/.md file.`
  );
}
