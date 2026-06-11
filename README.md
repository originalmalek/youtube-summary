# YouTube Summary

An AI-powered summarization platform that turns YouTube videos, uploaded documents, and raw text into clean, structured summaries. Full-stack application with a FastAPI backend and a Next.js frontend.

## Features

- **Multiple sources** — summarize YouTube videos (via transcript), uploaded files, or pasted text.
- **9 summary formats** — standard, bullet points, key takeaways, executive summary, Q&A, action items, pros & cons, timeline, and study guide.
- **Multi-language** — generate summaries in your preferred language.
- **Authentication** — JWT access/refresh tokens with email verification.
- **History & sharing** — save your summaries and share them via public links.
- **Background processing** — long-running jobs handled by Celery workers with progress tracking.
- **Rate limiting & usage limits** — per-user monthly limits and per-endpoint rate limiting.

## Tech Stack

**Backend**
- FastAPI (Python)
- MongoDB (Motor async driver)
- OpenAI API for summarization
- AuthX for JWT authentication
- Celery + Redis for background tasks
- SMTP email with HTML templates

**Frontend**
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand for state management
- Axios with token-refresh interceptors

## Project Structure

```
.
├── backend/                 # FastAPI REST API
│   ├── main.py              # App entry: lifespan, CORS, routers
│   ├── routers/             # API endpoints (auth, summary, share, user, ...)
│   ├── utils/               # Core services (db, security, llm, mail, config)
│   ├── workers/             # Celery background task processors
│   ├── templates/           # HTML email templates
│   └── tests/               # pytest suite
├── frontend/                # Next.js application
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   └── lib/                 # API client, stores, utilities
├── nginx/                   # Reverse proxy config
└── docker-compose.yml       # Local orchestration
```

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB
- Redis (for background workers)
- An OpenAI API key

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Create a .env file (see "Environment Variables" below)
uvicorn main:app --reload --port 8000
```

API docs are available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### Docker

```bash
docker compose up --build
```

## Environment Variables

### Backend (`backend/.env`)

```bash
# Database
MONGODB_URL=mongodb://localhost:27017
MONGODB_NAME=youtube_summary
MODE=DEV

# Security
JWT_SECRET_KEY=your-jwt-secret
SECRET_KEY=your-general-secret

# AI
OPENAI_API_KEY=sk-...
OPENAI_MODEL_NAME=gpt-4o-mini
YOUTUBE_DATA_API_KEY=your-youtube-api-key

# Email
MAIL_CONSOLE=true            # print emails to console in dev
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_SERVER=
MAIL_FROM=
MAIL_PORT=465

# Background tasks
REDIS_URL=redis://localhost:6379/0

# URLs
ROOT_URL=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=YouTube Summary
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm test
```

## License

This project is provided as-is for educational and portfolio purposes.
