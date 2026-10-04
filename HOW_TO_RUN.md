# NYAY AI — Windows Quick Start & Execution Guide

This guide walks you through extracting, configuring, and running the **Nyay AI — Maharashtra Legal Research Assistant** application on any Windows 10/11 laptop.

---

## 1. System Requirements

| Requirement | Minimum Version | Notes |
|---|---|---|
| **Operating System** | Windows 10 or 11 (64-bit) | Standard Command Prompt (`cmd`) or PowerShell |
| **Python** | 3.10.x or 3.11.x | Download from [python.org](https://www.python.org/downloads/) *(Ensure "Add Python to PATH" is checked)* |
| **Node.js & npm** | Node 18.x or 20.x (LTS) | Download from [nodejs.org](https://nodejs.org/) |
| **Internet Access** | Active Internet | Required for Google Gemini LLM API calls and first-time package downloads |
| **Gemini API Key** | Google AI Studio Key | Free API key from [aistudio.google.com](https://aistudio.google.com/) |

---

## 2. Fast Setup (1-Click Method)

We provide preconfigured Windows batch scripts in the root directory:

### Step 1: Run Dependency Setup
Double-click:
```cmd
1_setup_windows.bat
```
This automated script will:
1. Verify that Python and Node.js are properly installed and available in PATH.
2. Create a clean isolated Python virtual environment in `.venv`.
3. Install all backend dependencies (FastAPI, PyMuPDF, LangChain, ChromaDB, etc.).
4. Install all frontend dependencies inside `frontend/node_modules/`.
5. Create a local `.env` file from `.env.example`.

### Step 2: Configure Your Gemini API Key
1. Open the newly created `.env` file in Notepad:
   ```cmd
   notepad .env
   ```
2. Locate the line:
   ```env
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   ```
3. Replace `YOUR_GEMINI_API_KEY_HERE` with your actual Google Gemini API key (e.g., `AIzaSy...`).
4. Save the file (`Ctrl+S`) and close Notepad.

### Step 3: Launch the Application
Double-click:
```cmd
run_all.bat
```
*(Alternatively, you can launch `2_run_backend.bat` and `3_run_frontend.bat` in separate windows).*

Your browser will automatically open:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 3. Manual Terminal Setup (Step-by-Step Alternative)

If you prefer to run the setup manually in Command Prompt or PowerShell:

### Step 1: Open Terminal in the Extracted Folder
Open Command Prompt and navigate to the extracted directory:
```cmd
cd path\to\Nyay_AI_PORTABLE_PACKAGE
```

### Step 2: Set Up Python Virtual Environment
```cmd
python -m venv .venv
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip
python -m pip install -r backend\requirements.txt
```

### Step 3: Install Frontend Dependencies
```cmd
cd frontend
npm install
cd ..
```

### Step 4: Configure Environment Variables
```cmd
copy .env.example .env
notepad .env
```
Add your `GEMINI_API_KEY`, save, and close Notepad.

### Step 5: Start the Backend Server (Terminal 1)
```cmd
call .venv\Scripts\activate.bat
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```
*Backend will start on `http://127.0.0.1:8000`.*

### Step 6: Start the Frontend Server (Terminal 2)
Open a new terminal window in the project directory:
```cmd
cd frontend
npm run dev
```
*Frontend will start on `http://localhost:5173`.*

---

## 4. Key Application URLs

| Service | Local URL | Description |
|---|---|---|
| **Frontend Portal** | `http://localhost:5173` | Complete legal research interface |
| **Documents Page** | `http://localhost:5173/#/documents` | 65 Official statutes & private workspace uploads |
| **Evaluation Dashboard**| `http://localhost:5173/#/evaluation` | Research paper empirical benchmarks |
| **Backend API Docs** | `http://127.0.0.1:8000/docs` | Interactive Swagger API documentation |
| **Official Corpus API** | `http://127.0.0.1:8000/corpus` | Document inventory & chunk metadata |

---

## 5. Troubleshooting & FAQ

### 1. `python` or `node` is not recognized
- **Solution**: Install Python or Node.js, and make sure to check the option **"Add to PATH"** in the installer wizard. After installation, restart your Command Prompt window.

### 2. HTTP 502 / Backend Connection Error in Frontend
- **Cause**: The backend server is not running on port 8000.
- **Solution**: Check the backend terminal window. Ensure `python -m uvicorn backend.app:app --port 8000` is running without errors.

### 3. Gemini API 429 Quota Exceeded
- **Cause**: Free tier request limit exceeded on older models.
- **Solution**: Verify that `GEMINI_MODEL=gemini-3.5-flash-lite` is set in your `.env`. This model provides optimal token quotas and responsiveness on the free tier.

### 4. Official Corpus Table Empty
- **Cause**: Backend not reachable or proxy not routing.
- **Solution**: Ensure you are accessing `http://localhost:5173` (Vite dev server) so that `/corpus` is properly proxied to FastAPI.

### 5. Port Conflicts (`Port 8000` or `Port 5173` already in use)
- **Solution**:
  - To kill an existing process on port 8000:
    ```cmd
    netstat -ano | findstr :8000
    taskkill /PID <PID_NUMBER> /F
    ```

---

## 6. How to Stop the Application
To shut down Nyay AI cleanly:
1. Go to the **Backend** terminal window and press `Ctrl + C`.
2. Go to the **Frontend** terminal window and press `Ctrl + C`, then type `y` and press `Enter`.
