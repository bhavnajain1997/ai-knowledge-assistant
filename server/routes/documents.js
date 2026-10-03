import { Router } from "express";
import { upload } from "../middleware/upload.js";
import {
  uploadDocument,
  listDocuments,
  deleteDocument,
  getDocumentMeta,
} from "../controllers/documentsController.js";

const router = Router();

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", listDocuments);
router.get("/:docId", getDocumentMeta);
router.delete("/:docId", deleteDocument);

export default router;
