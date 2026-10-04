# Research-paper alignment

| Paper component | Implementation |
|---|---|
| React.js UI | `frontend/` |
| PDF upload | React -> `/upload` |
| FastAPI | `backend/app.py` |
| JWT authentication | `/auth/register`, `/auth/login`, bearer-protected APIs |
| Orchestrator | `Orchestrator` |
| Ingestion Agent | `IngestionAgent` |
| Retriever Agent | `RetrieverAgent`, top-5 cosine ranking |
| Answer Generation Agent | `AnswerGenerationAgent`, Gemini 3.6 Flash |
| Citation & Confidence Agent | `CitationConfidenceAgent` |
| PyMuPDF | PDF text extraction |
| LangChain | LangChain Chroma + HuggingFace integration; 500/50 sentence-aware chunking |
| MiniLM | all-MiniLM-L6-v2, 384 dimensions |
| ChromaDB | persistent official corpus + per-user workspace collections |
| Output | plain-language answer + source/page citations + Corpus-Grounded/General confidence |
| Deployment | Vercel frontend config + Render backend config |

The current implementation uses Gemini 3.6 Flash because that is the configured/working LLM for this project. If the research paper still names Claude/GPT-3.5, update the paper's LLM row and methodology to Gemini 3.6 Flash before final submission; do not claim Claude was used.

The implementation does not silently claim human groundedness/citation accuracy. Those metrics remain evaluation outputs requiring the project's review protocol.
