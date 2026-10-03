import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "data", "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nanoid(10)}${ext}`);
  },
});

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
]);
const ALLOWED_EXT = new Set([".pdf", ".txt", ".md"]);

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_TYPES.has(file.mimetype) || ALLOWED_EXT.has(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, .txt, and .md files are supported."));
  }
}

const maxMb = Number(process.env.MAX_UPLOAD_MB || 20);

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxMb * 1024 * 1024 },
});
