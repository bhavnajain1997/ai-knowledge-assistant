import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 60000,
});

export async function uploadDocument(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (onProgress && evt.total) {
        onProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    },
  });
  return data.document;
}

export async function fetchDocuments() {
  const { data } = await api.get("/documents");
  return data.documents;
}

export async function deleteDocument(docId) {
  const { data } = await api.delete(`/documents/${docId}`);
  return data;
}

export async function askQuestion({ question, sessionId, docIds }) {
  const { data } = await api.post("/chat", { question, sessionId, docIds });
  return data;
}

export async function fetchSessions() {
  const { data } = await api.get("/history");
  return data.sessions;
}

export async function fetchSession(sessionId) {
  const { data } = await api.get(`/history/${sessionId}`);
  return data.session;
}

export async function renameSession(sessionId, title) {
  const { data } = await api.put(`/history/${sessionId}`, { title });
  return data.session;
}

export async function deleteSession(sessionId) {
  const { data } = await api.delete(`/history/${sessionId}`);
  return data;
}

export async function fetchSummary(docId) {
  const { data } = await api.get(`/summary/${docId}`);
  return data;
}

export async function fetchQuiz(docId, count = 8) {
  const { data } = await api.get(`/quiz/${docId}`, { params: { count } });
  return data;
}

export default api;
