import { useRef, useState } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { uploadDocument } from "../services/api.js";

export default function DocumentUpload({ onUploaded }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  async function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    setProgress(0);
    try {
      const doc = await uploadDocument(file, setProgress);
      onUploaded(doc);
    } catch (err) {
      setError(err?.response?.data?.error || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setProgress(0);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-colors ${
          dragActive
            ? "border-brass-500 bg-brass-500/10"
            : "border-ink-600 hover:border-moss-400 hover:bg-ink-800/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-parchment-200">
            <Loader2 className="animate-spin" size={22} />
            <span className="text-xs font-mono">Indexing… {progress}%</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-parchment-300">
            <UploadCloud size={22} className="text-moss-400" />
            <span className="text-sm font-medium">Drop a PDF or .txt/.md file</span>
            <span className="text-xs text-parchment-300/60">or click to browse</span>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  );
}
