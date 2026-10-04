# Nyay AI — Maharashtra Legal Research Assistant

A research-paper-aligned multi-agent legal intelligence platform for statutory retrieval, grounding, and verification across 65 official Maharashtra Acts, Rules, Government Resolutions, and Bombay High Court Precedents.

---

## Overview

Nyay AI implements a multi-agent Retrieval-Augmented Generation (RAG) architecture:
- **FastAPI Orchestrator**: Handles JWT authentication, per-user workspace isolation, session management, and document ingestion.
- **Official Maharashtra Legal Corpus**: Pre-indexed vector store containing **65 official statutes and 5,259 vector chunks** in ChromaDB.
- **Private User Workspace**: Isolated per-account vector storage allowing advocates to upload contracts, petitions, and pleadings without leaking data to the shared corpus.
- **Grounding & Evidence Protocol**: Strict statutory citations mapped directly to source chunk page numbers with evidence sufficiency classification (*Corpus-Supported*, *Partial Evidence*, *Insufficient Evidence*).
- **Trilingual Legal Portal**: Full localized interfaces in English, Marathi, and Hindi.

---

## Quick Start on Windows

1. Run the setup script:
   ```cmd
   1_setup_windows.bat
   ```
2. Open `.env` and paste your Gemini API key from [Google AI Studio](https://aistudio.google.com/):
   ```env
   GEMINI_API_KEY=your_key_here
   ```
3. Launch the application:
   ```cmd
   run_all.bat
   ```
4. Access the web portal at **`http://localhost:5173`**.

For detailed setup instructions and troubleshooting, refer to **`HOW_TO_RUN.md`**.

---

## Project Structure

- `backend/` — FastAPI application, vector store integrations, and query orchestration.
- `database/chroma_final/` — Official ChromaDB vector collection (65 statutes, 5,259 chunks).
- `database/user_upload_chroma/` — Isolated per-user document workspace store.
- `dataset_info/` — Verified inventory of all 65 official statutes and source metadata.
- `documentation/` — Architectural specifications, run guides, and paper alignment documents.
- `evaluation/` — Empirical evaluation benchmarks and legal correctness audits.
- `frontend/` — React 18 + Vite frontend with custom Indian legaltech design system.
- `tests/` — Automated test harnesses for evidence verification and API compliance.
