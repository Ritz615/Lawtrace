# LexAI – Enterprise AI Contract Lifecycle Management Platform

<div align="center">
  <h1>⚖️ LexAI</h1>
  <p><strong>AI-Powered Enterprise Contract Lifecycle Management</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs" />
    <img src="https://img.shields.io/badge/FastAPI-0.111-green?style=flat-square&logo=fastapi" />
    <img src="https://img.shields.io/badge/LangGraph-Agents-orange?style=flat-square" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql" />
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" />
  </p>
</div>

---

## Overview

LexAI is a modern, enterprise-grade SaaS platform that helps businesses, law firms, HR departments, and individuals manage the **complete lifecycle of legal contracts** using Artificial Intelligence.

It combines **document management**, **AI contract analysis**, **legal research**, **workflow automation**, **collaboration**, and **analytics** into one intelligent platform.

> Think: Notion meets Harvey AI meets Stripe Dashboard — but for legal contracts.

---

## Features

| Module | Description |
|--------|-------------|
| 📁 **Document Management** | Upload PDF, DOCX, images. Folders, tags, version history, search |
| 🔍 **OCR Engine** | Auto-extract text from scanned documents via EasyOCR + PyMuPDF |
| 🤖 **AI Contract Intelligence** | Extract 14+ clause types, generate summaries, detect missing clauses |
| ⚠️ **AI Risk Analyzer** | Risk score (Low/Medium/High/Critical) with business impact explanations |
| 💬 **AI Legal Assistant** | RAG-powered chatbot — ask questions about your uploaded contracts |
| 📝 **Contract Generator** | Generate 9 contract types from structured forms using LLM |
| 🔄 **Contract Comparison** | Side-by-side diff of two contracts with clause-level changes |
| 🔬 **Legal Research** | Search relevant acts, principles, and legal concepts |
| 📊 **Analytics Dashboard** | Monthly uploads, risk distribution, dept-wise breakdown |
| 📄 **Reports** | Downloadable PDF/DOCX with executive summary, clause analysis, risk report |
| 🔔 **Notifications** | Real-time alerts for renewals, expirations, pending reviews |

---

## Tech Stack

### Frontend
- **Next.js 15** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui**
- **Framer Motion** (animations)
- **Recharts** (data visualization)
- **React Hook Form** + **Zod** (forms + validation)
- **Zustand** (state management)

### Backend
- **FastAPI** (Python) — async REST API
- **SQLAlchemy** + **Alembic** (ORM + migrations)
- **JWT** + RBAC authentication
- **Celery** + **Redis** (background AI jobs)
- **WebSockets** (real-time job status)

### AI Stack
- **LangChain** + **LangGraph** (multi-agent orchestration)
- **Llama 3 via Ollama** (local dev) / **GPT-4 / Gemini** (production)
- **ChromaDB** (vector database for RAG)
- **BAAI/bge-small-en-v1.5** (embeddings)
- **EasyOCR** + **PyMuPDF** (OCR)
- **spaCy** (NLP)

### Infrastructure
- **PostgreSQL 16** (primary database)
- **Redis** (cache + Celery broker)
- **MinIO** (S3-compatible local storage)
- **Docker** + **Docker Compose**

---

## Getting Started

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- Python 3.11+
- Ollama (for local LLM)

### 1. Clone the repository
```bash
git clone https://github.com/Ritz615/Lawtrace.git
cd Lawtrace
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Start all services
```bash
make dev
# OR
docker-compose up -d
```

### 4. Install and run frontend
```bash
cd frontend
npm install
npm run dev
```

### 5. Install and run backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 6. Pull Ollama model (for local AI)
```bash
ollama pull llama3
```

Frontend: http://localhost:3000  
Backend API: http://localhost:8000  
Swagger Docs: http://localhost:8000/docs  
MinIO Console: http://localhost:9001  

---

## Project Structure

```
lexai/
├── frontend/          # Next.js 15 + TypeScript
├── backend/           # FastAPI + LangGraph AI
├── .agents/           # Knowledge Curator (AGENTS.md)
├── docker-compose.yml
├── docker-compose.prod.yml
├── Makefile
├── .env.example
└── README.md
```

---

## AI Agent Architecture

```
DocumentAgent ──► ClauseAgent ──► SummaryAgent
                              ──► RiskAgent
                              ──► ComparisonAgent
DraftingAgent (contract generation)
ResearchAgent (legal research)
ReportAgent   (PDF/DOCX compilation)
```

All agents orchestrated via **LangGraph** state machine.  
Processing handled asynchronously via **Celery + Redis**.

---

## User Roles

| Role | Permissions |
|------|-------------|
| **Administrator** | Full platform access, user management, AI settings |
| **Lawyer** | Review contracts, edit AI findings, approve reports |
| **HR Manager** | Generate employment agreements, track HR contracts |
| **Business User** | Upload contracts, monitor risks, generate reports |
| **Client** | Upload documents, chat with AI, download reports |

---

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 0 | Repo setup, Docker, Knowledge Curator | 🔄 In Progress |
| Phase 1 | Auth, DB models, layout shell | ⏳ Pending |
| Phase 2 | Dashboard, Document Management | ⏳ Pending |
| Phase 3 | AI Pipeline (OCR, RAG, Risk, Comparison) | ⏳ Pending |
| Phase 4 | Contract Generator, Legal Research | ⏳ Pending |
| Phase 5 | Reports, Notifications, Analytics | ⏳ Pending |
| Phase 6 | Tests, Docker Prod, CI/CD | ⏳ Pending |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/phase-X-description`
3. Commit changes: `git commit -m "feat(scope): description"`
4. Push: `git push origin feature/phase-X-description`
5. Open a Pull Request targeting `dev` branch

**Commit types**: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`

---

## Team

| Member | Role |
|--------|------|
| Ritz615 | Lead Developer — Frontend + Auth + Document Management |
| Teammate | AI Engineer — Backend AI Pipeline + Reports |

---

## License

MIT License. See [LICENSE](LICENSE) for details.
