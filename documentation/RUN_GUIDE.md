# Nyay AI Run Guide

1. Install Python 3.10+ and Node.js 18+.
2. Copy `.env.example` to `.env`.
3. Add a Gemini API key and a long random `JWT_SECRET`.
4. Double-click `run_backend.bat`.
5. Double-click `run_frontend.bat`.
6. Open http://localhost:5173.
7. Register a user and log in.
8. Ask official-corpus questions or upload a text-based PDF and query it.

The backend loads the included persistent ChromaDB. It does not rebuild the official corpus at startup.

For Vercel, deploy `frontend/` and set `VITE_API_URL`.
For Render, use `render.yaml` and set `GEMINI_API_KEY`, `JWT_SECRET`, and `CORS_ORIGINS`.
