# Athenaeum — AI Knowledge Assistant

A production-ready **Retrieval-Augmented Generation (RAG)** application. Upload PDF or text
documents, ask questions in a chat interface, and get answers grounded in your own sources
with inline citations — falling back to Gemini's general knowledge when nothing relevant is
found. Also generates document summaries and multiple-choice quizzes on demand.

**Stack:** React (Vite) · Node.js / Express · Google Gemini API (chat, embeddings)

---

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Folder structure](#folder-structure)
- [Prerequisites](#prerequisites)
- [Setup instructions](#setup-instructions)
- [Environment variables](#environment-variables)
- [API reference](#api-reference)
- [How the RAG pipeline works](#how-the-rag-pipeline-works)
- [Deployment instructions](#deployment-instructions)
- [Troubleshooting](#troubleshooting)
- [Roadmap ideas](#roadmap-ideas)

---

## Features

- 📄 **Document upload** — PDF, `.txt`, `.md`, parsed and chunked automatically
- 🔍 **RAG chat** — questions are answered from your documents first, with source citations
- 🌐 **General-knowledge fallback** — if no relevant chunk is found, Gemini answers from its
  own knowledge and clearly labels the answer as not being document-grounded
- 🔖 **Source citations** — every grounded answer shows which document/chunk it came from,
  plus a relevance score
- 💬 **Persistent chat history** — every conversation is saved server-side; switch between
  past conversations, rename or delete them, and pick up right where you left off after a
  page reload
- 📝 **Document summaries** — one-click executive summary + key bullet points per document
- ❓ **Quiz generation** — auto-generated multiple-choice quizzes with instant grading and
  explanations
- 🗂️ **Multi-document library** — select which documents are "in scope" for a chat session
- 💅 **Modern responsive UI** — custom design system (not a generic template), works on
  mobile and desktop

---

## Architecture

```
┌─────────────────┐        REST/JSON        ┌───────────────────┐        ┌──────────────┐
│   React (Vite)   │ ──────────────────────▶ │  Express API       │ ─────▶ │  Gemini API   │
│   client/        │ ◀────────────────────── │  server/           │ ◀───── │  (chat +      │
└─────────────────┘                          │                    │        │  embeddings)  │
                                              │  ┌──────────────┐  │        └──────────────┘
                                              │  │ vector store │  │
                                              │  │ (JSON file)  │  │
                                              │  └──────────────┘  │
                                              └───────────────────┘
```

- The **client** never talks to Gemini directly — all API calls go through the Express
  backend, keeping the API key server-side.
- The **backend** extracts text from uploads, splits it into overlapping chunks, embeds each
  chunk with Gemini's `text-embedding-004` model, and stores vectors in a lightweight
  JSON-backed store (swap for Pinecone/Weaviate/pgvector in production — see
  [Roadmap ideas](#roadmap-ideas)).
- On each chat message, the question is embedded, compared against stored chunks via cosine
  similarity, and the top matches above a relevance threshold are injected into the Gemini
  prompt as grounding context. If nothing clears the threshold, Gemini answers from general
  knowledge instead and the UI marks the reply accordingly.

---

## Folder structure

```
ai-knowledge-assistant/
├── server/                      # Node.js + Express backend
│   ├── config/
│   │   └── gemini.js             # Gemini client + RAG tuning constants
│   ├── controllers/
│   │   ├── documentsController.js
│   │   ├── chatController.js
│   │   ├── summaryController.js
│   │   ├── quizController.js
│   │   └── historyController.js
│   ├── middleware/
│   │   ├── upload.js             # Multer config (file type/size limits)
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── documents.js
│   │   ├── chat.js
│   │   ├── summary.js
│   │   ├── quiz.js
│   │   └── history.js
│   ├── services/
│   │   ├── documentProcessor.js  # PDF/text extraction
│   │   ├── geminiService.js      # embeddings, chat, summary, quiz generation
│   │   ├── vectorStore.js        # in-memory + JSON-persisted vector store
│   │   └── chatHistoryStore.js   # in-memory + JSON-persisted chat sessions
│   ├── utils/
│   │   ├── chunker.js            # sentence-aware overlapping text chunking
│   │   └── similarity.js         # cosine similarity
│   ├── data/
│   │   ├── uploads/               # uploaded files land here
│   │   └── store/
│   │       ├── vectorstore.json   # persisted document + chunk index
│   │       └── chatHistory.json   # persisted chat sessions + messages
│   ├── .env.example
│   ├── package.json
│   └── server.js                 # app entry point
│
├── client/                      # React (Vite) frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── TabNav.jsx
│   │   │   ├── DocumentUpload.jsx
│   │   │   ├── DocumentList.jsx
│   │   │   ├── ConversationList.jsx
│   │   │   ├── ChatPanel.jsx
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── CitationBadge.jsx
│   │   │   ├── SummaryPanel.jsx
│   │   │   └── QuizPanel.jsx
│   │   ├── services/api.js       # axios client for the backend
│   │   ├── styles/index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
└── README.md                    # this file
```

---

## Prerequisites

- **Node.js 18+** and npm
- A **Gemini API key** — create one free at https://aistudio.google.com/app/apikey

---

## Setup instructions

### 1. Clone and install

```bash
git clone <your-fork-url> ai-knowledge-assistant
cd ai-knowledge-assistant

# Backend
cd server
npm install
cp .env.example .env
# then edit .env and paste your GEMINI_API_KEY

# Frontend (in a new terminal)
cd ../client
npm install
```

### 2. Run in development

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client
npm run dev
```

Open **http://localhost:5173** — the Vite dev server proxies `/api/*` requests to the
backend, so no CORS configuration is needed locally.

### 3. Try it out

1. Drop a PDF or `.txt`/`.md` file into the upload zone in the sidebar.
2. Wait for indexing to finish (chunking + embedding happens server-side).
3. Ask a question in the **Chat** tab — you'll see the answer plus source citations.
4. Click a document, then open the **Summary** or **Quiz** tab to generate those views.

---

## Environment variables

### `server/.env`

| Variable                | Default                  | Description                                              |
|--------------------------|--------------------------|------------------------------------------------------------|
| `GEMINI_API_KEY`         | *(required)*              | Your Gemini API key                                        |
| `PORT`                   | `5000`                    | Backend port                                                |
| `CLIENT_ORIGIN`          | `http://localhost:5173`   | Comma-separated allowed CORS origins                        |
| `GEMINI_CHAT_MODEL`      | `gemini-2.0-flash`        | Model used for chat/summary/quiz generation                 |
| `GEMINI_EMBEDDING_MODEL` | `text-embedding-004`      | Model used for embeddings                                    |
| `CHUNK_SIZE`             | `1000`                    | Target characters per chunk                                  |
| `CHUNK_OVERLAP`          | `150`                     | Overlap characters between chunks                             |
| `TOP_K`                  | `5`                       | Number of chunks retrieved per query                          |
| `SIMILARITY_THRESHOLD`   | `0.55`                    | Minimum cosine similarity to count as "relevant" (0-1)        |
| `MAX_UPLOAD_MB`          | `20`                      | Max upload file size in MB                                    |

### `client/.env` (optional)

| Variable               | Description                                                        |
|--------------------------|----------------------------------------------------------------------|
| `VITE_API_BASE_URL`      | Override the API base URL (needed in production if not proxied)     |

---

## API reference

Base URL: `http://localhost:5000/api`

| Method | Endpoint                | Description                                   |
|--------|--------------------------|------------------------------------------------|
| GET    | `/health`                | Health check                                    |
| POST   | `/documents/upload`      | Upload + index a document (`multipart/form-data`, field `file`) |
| GET    | `/documents`             | List all uploaded documents                     |
| GET    | `/documents/:docId`      | Get metadata for one document                    |
| DELETE | `/documents/:docId`      | Delete a document and its chunks                  |
| POST   | `/chat`                  | Ask a question — body: `{ question, sessionId?, docIds? }` |
| GET    | `/summary/:docId`        | Generate a summary for a document                  |
| GET    | `/quiz/:docId?count=8`   | Generate an N-question multiple-choice quiz         |
| GET    | `/history`               | List all saved chat conversations                    |
| POST   | `/history`               | Create a new empty conversation — body: `{ title? }`  |
| GET    | `/history/:sessionId`    | Get full message history for one conversation         |
| PUT    | `/history/:sessionId`    | Rename a conversation — body: `{ title }`               |
| DELETE | `/history/:sessionId`    | Delete a conversation                                    |

**Example: ask a question**

```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the main findings?"}'
```

```json
{
  "sessionId": "S1fQ47Tif3Mj",
  "answer": "According to [Source 1], the main findings are...",
  "citations": [
    {
      "documentId": "abc123",
      "documentName": "report.pdf",
      "chunkIndex": 4,
      "snippet": "The study found that...",
      "relevanceScore": 0.81
    }
  ],
  "groundedInDocuments": true
}
```

Omit `sessionId` on the first message of a new conversation — the backend creates one
automatically and returns its id, which the client should send with subsequent messages
in that thread.

---

## How the RAG pipeline works

1. **Extract** — `pdf-parse` (PDFs) or direct file read (`.txt`/`.md`) pulls out raw text.
2. **Chunk** — `utils/chunker.js` splits text into ~1000-character, sentence-aware chunks
   with a 150-character overlap so context isn't lost at chunk boundaries.
3. **Embed** — each chunk is embedded with Gemini's `text-embedding-004` model
   (`taskType: RETRIEVAL_DOCUMENT`) and stored alongside its text and source metadata.
4. **Query** — when a question comes in, it's embedded with `taskType: RETRIEVAL_QUERY`,
   compared against every stored chunk via cosine similarity, and the top `TOP_K` matches
   above `SIMILARITY_THRESHOLD` are kept.
5. **Generate** — if relevant chunks were found, they're injected into the Gemini prompt as
   numbered "Source" excerpts and the model is instructed to cite them inline (`[Source N]`).
   If none clear the threshold, Gemini is prompted to answer from general knowledge and to
   say so explicitly — the API also returns `groundedInDocuments: false` so the UI can label
   the response.

This is a from-scratch, dependency-light RAG implementation so the mechanics are easy to
follow and modify. For larger corpora, swap `services/vectorStore.js` for a real vector
database (see [Roadmap ideas](#roadmap-ideas)).

---

## Deployment instructions

### Option A — Split deployment (recommended)

**Backend → Render / Railway / Fly.io / a VPS**

1. Push the repo to GitHub.
2. Create a new Node web service pointing at the `server/` directory.
   - Build command: `npm install`
   - Start command: `npm start`
   - Add environment variables from `server/.env.example` (set your real `GEMINI_API_KEY`,
     and set `CLIENT_ORIGIN` to your deployed frontend URL).
3. Note the deployed API URL, e.g. `https://your-api.onrender.com`.
4. **Persistent storage caveat:** the default vector store writes to
   `server/data/store/vectorstore.json`, chat conversations to
   `server/data/store/chatHistory.json`, and uploaded files to `server/data/uploads/`. Most
   PaaS platforms use ephemeral filesystems that reset on redeploy — attach a persistent
   volume/disk, or migrate to a real database (see Roadmap) for production use.

**Frontend → Vercel / Netlify**

1. Import the repo, set the project root to `client/`.
2. Build command: `npm run build` · Output directory: `dist`
3. Set environment variable `VITE_API_BASE_URL=https://your-api.onrender.com/api`.
4. Deploy.

### Option B — Single VPS (both services together)

```bash
# On the server
git clone <your-fork-url> && cd ai-knowledge-assistant

cd server && npm install && npm ci --omit=dev
cp .env.example .env   # fill in GEMINI_API_KEY, set CLIENT_ORIGIN to your domain
npm install -g pm2
pm2 start server.js --name knowledge-assistant-api

cd ../client && npm install && npm run build
# Serve client/dist with nginx, or:
npm install -g serve
pm2 start "serve -s dist -l 4173" --name knowledge-assistant-web
```

Example nginx reverse proxy (routes `/api` to the backend, serves the built frontend for
everything else):

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location /api/ {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
  }

  location / {
    root /path/to/ai-knowledge-assistant/client/dist;
    try_files $uri /index.html;
  }
}
```

### Option C — Docker

`server/Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

`client/Dockerfile`:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

Mount a volume at `/app/data` on the server container to persist uploads and the vector
store across restarts.

---

## Troubleshooting

- **"GEMINI_API_KEY is not set" warning on boot** — copy `.env.example` to `.env` in
  `server/` and add your key.
- **CORS errors in the browser** — make sure `CLIENT_ORIGIN` in `server/.env` matches the
  exact origin your frontend is served from (including protocol and port).
- **Uploads fail with "Couldn't extract meaningful text"** — the PDF is likely scanned
  images without a text layer; OCR isn't included out of the box (see Roadmap).
- **Answers ignore my documents** — try lowering `SIMILARITY_THRESHOLD` in `server/.env`
  (e.g. `0.45`), or make sure the relevant document's checkbox is selected in the sidebar.
- **Vector store resets after redeploy** — see the persistent storage caveat under
  [Deployment instructions](#deployment-instructions).

---

## Roadmap ideas

- Swap the JSON vector store for pgvector, Pinecone, Weaviate, or Qdrant for scale
- Add OCR (e.g. Tesseract) for scanned PDFs
- Streaming responses (Server-Sent Events) for token-by-token chat output
- User accounts + per-user document libraries
- DOCX / CSV / URL ingestion
- Automated tests (Jest/Vitest) and CI pipeline

---

## License

MIT — use this as a starting point for your own projects.
