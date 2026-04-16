# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Folio is a portfolio analysis platform with three services:
- **Web/** — React 19 + TypeScript frontend (Vite)
- **backend/** — Express.js + Node.js REST API (auth + profile)
- **ai_server/** — FastAPI Python AI service (OCR + LLM analysis)

## Development Commands

### Frontend (Web/)
```bash
cd Web
npm install
npm run dev        # Vite dev server on :5173
npm run build      # tsc -b && vite build
npm run lint       # ESLint
npm run preview    # Preview production build
```

### Backend (backend/)
```bash
cd backend
npm install
npm start          # node src/index.js on :5001
```

Database setup (requires MySQL running locally):
```bash
mysql -u root -p < backend/mysql/init.sql
```

### AI Server (ai_server/)
```bash
# From project root — entry point is main.py at root level
uvicorn main:app --reload   # Starts on :8000
```

The Python virtual environment is at `.venv/`. The AI server uses Python 3.13.2.

## Architecture

### Service Communication
```
Browser
  ↕ (REST)
Web/:5173           → /api/auth/*, /api/profile/* → backend/:5001 (Express + MySQL)
                    → /api/analyze, /api/ocr, /api/layout → ai_server/:8000 (FastAPI)
                                                               ↕ (OpenAI SDK)
                                                           Upstage Solar LLM API
```

During development, Vite proxies all `/api/*` paths to the correct upstream. In production, the targets are configured via env vars (`VITE_API_BASE`, `VITE_AI_BASE`).

### Authentication Flow
1. Login → POST `/api/auth/login` → JWT (7-day) stored in `localStorage` as `token`
2. Subsequent requests include `Authorization: Bearer <token>`
3. Redux `loginSlice` tracks boolean login state; localStorage persists across reloads
4. On 401/403, frontend clears localStorage and redirects to `/login`

### AI Processing Pipeline
```
File upload (PDF/PNG/JPG)
  → OCR (pdfplumber for PDF, EasyOCR for images)
  → Layout extraction (tokens → lines → blocks, Y-threshold 8px, gap 18px)
  → LLM structuring (Upstage Solar: extract projects/skills/education)
  → LLM consulting (recommendations, skill radar, roadmap, company matches)
  → JSON response cached in localStorage as `analysisResult`
```

### Frontend Routing (React Router v6)
```
/           MainPage
/Analysis   File upload & portfolio analysis
/Recommend  Skill recommendations
/Roadmap    Career growth roadmap
/Review     Portfolio review feedback
/login      Login
/signup     Registration
/mypage     User profile (protected)
```

### localStorage Keys
- `token` — JWT for auth
- `myPageData` — Cached user profile (`PROFILE_STORAGE_KEY`)
- `analysisResult` — Cached AI analysis output (`ANALYSIS_STORAGE_KEY`)

## Environment Variables

### Frontend (Web/.env.development)
```
VITE_API_BASE=http://localhost:5001
VITE_AI_BASE=http://localhost:8000
```

### Backend (backend/.env)
```
PORT=5001
JWT_SECRET=career_ai_secret_2026
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=career
DB_PASSWORD=career1234
DB_NAME=career_ai
```

### AI Server (ai_server/models/.env)
```
UPSTAGE_API_KEY=<required>
```

## Database

MySQL database `career_ai` with a single `users` table. The `stacks` column is a JSON array of tech stacks. Initialization script: `backend/mysql/init.sql`.

## Key Technology Notes

- **LLM**: Upstage Solar Pro accessed via OpenAI SDK pointing to `https://api.upstage.ai/v1`. LLM prompts are in `ai_server/engines/pipeline.py` — structure prompt (~164 lines) and consulting prompt (~95 lines), both expecting strict JSON output (no markdown).
- **Charts**: Recharts radar chart for skill visualization, bar chart for role matching.
- **Styling**: styled-components for scoped styles, React Bootstrap for layout/form components.
- **FastAPI entry point**: `main.py` is at the repo root, not inside `ai_server/`. Run uvicorn from the repo root.
