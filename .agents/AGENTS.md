# LexAI – Knowledge Curator

> This file is the single source of truth for the LexAI project.
> Every team member and AI agent MUST read this before making changes.
> Update this file at the start of each new phase.

---

## Project Identity

**Name**: LexAI – Enterprise AI Contract Lifecycle Management Platform  
**Repo**: https://github.com/Ritz615/Lawtrace.git  
**Vision**: AI-powered legal operating system for full contract lifecycle management.  
**Target**: Production-quality enterprise SaaS — NOT a college demo.

---

## What LexAI IS

- A multi-module AI platform for managing, analyzing, and generating legal contracts
- Built with Next.js 15 frontend + FastAPI backend + LangGraph multi-agent AI
- Targeting law firms, corporates, HR depts, startups, individuals
- Must feel like Notion / Linear / Stripe Dashboard in quality and polish

---

## What LexAI IS NOT

- ❌ Not a simple chatbot or document summarizer
- ❌ Not an e-signature tool
- ❌ Not a general-purpose legal search engine
- ❌ Not a document storage app without AI

---

## Core Modules (NEVER remove or rename without team approval)

| Module | Status |
|--------|--------|
| Authentication + RBAC | Phase 1 |
| Dashboard | Phase 2 |
| Document Management | Phase 2 |
| OCR Engine | Phase 3 |
| AI Contract Intelligence (Clause Extraction) | Phase 3 |
| AI Risk Analyzer | Phase 3 |
| AI Legal Assistant (RAG Chatbot) | Phase 3 |
| AI Contract Generator | Phase 4 |
| Contract Comparison | Phase 3 |
| Legal Research | Phase 4 |
| Reports (PDF/DOCX) | Phase 5 |
| Notifications | Phase 5 |
| Analytics | Phase 5 |

---

## Technology Decisions (LOCKED — change requires team vote)

| Layer | Technology | Reason |
|-------|-----------|--------|
| Frontend | Next.js 15 + TypeScript | App Router, SSR, type safety |
| Styling | Tailwind CSS + shadcn/ui | Speed + consistency |
| Animations | Framer Motion | Premium feel |
| Charts | Recharts | React-native, lightweight |
| Backend | FastAPI (Python) | Async, OpenAPI auto-docs |
| ORM | SQLAlchemy + Alembic | Migrations, type-safe |
| Auth | JWT + RBAC | Stateless, role-based |
| Primary DB | PostgreSQL | Relational, robust |
| Cache | Redis | Sessions, Celery broker |
| Vector DB | ChromaDB | RAG embeddings |
| AI Framework | LangChain + LangGraph | Multi-agent orchestration |
| LLM (dev) | Llama 3 via Ollama | Free, local |
| LLM (prod) | GPT-4 / Gemini API | Commercial quality |
| Embeddings | BAAI/bge-small-en-v1.5 | Fast, free |
| OCR | EasyOCR + PyMuPDF | PDF + image support |
| NLP | spaCy | NER, preprocessing |
| Storage (dev) | MinIO (Docker) | S3-compatible locally |
| Storage (prod) | AWS S3 | Scalable cloud |
| Background Jobs | Celery + Redis | Async AI processing |
| Reports | ReportLab + python-docx | PDF + DOCX export |
| Deployment | Docker + Docker Compose | Reproducible environments |
| CI/CD | GitHub Actions | Automated testing |

---

## AI Agent Architecture (LangGraph)

```
DocumentAgent → ClauseAgent → SummaryAgent
                           → RiskAgent
                           → ComparisonAgent (2 docs)
DraftingAgent (standalone)
ResearchAgent (standalone)
ReportAgent (collects all outputs)
```

All agents are orchestrated via LangGraph state machine.  
Celery handles async execution. Redis is the broker.

---

## Design Rules (NEVER violate)

1. Dark mode + light mode BOTH supported
2. Glassmorphism cards where appropriate
3. Framer Motion transitions on all page changes
4. Premium typography: Inter font
5. No plain default colors — use the LexAI design token palette
6. All forms use React Hook Form + Zod validation
7. Mobile responsive at all times

---

## Git Workflow

| Branch | Purpose |
|--------|---------|
| `main` | Protected. Releases only. |
| `dev` | Integration. All PRs target here. |
| `feature/phase-*` | Feature branches per phase |

**Commit format**: `type(scope): message`  
Types: `feat`, `fix`, `docs`, `chore`, `test`, `refactor`

---

## API Contract

- Base URL: `/api/v1/`
- All responses: `{ success: bool, data: any, message: string }`
- Errors: `{ success: false, error: string, code: int }`
- Auth header: `Authorization: Bearer <jwt_token>`
- Docs: `/docs` (Swagger) and `/redoc`

---

## Out of Scope (Do NOT implement)

- E-signature integration (DocuSign, etc.)
- Real-time multi-user collaborative editing (Google Docs style)
- Billing / payment processing
- Mobile native app (React Native)
- Multi-language UI (English only for v1)

---

## Current Phase

**Phase 0 – Repository Setup** ✅ Started: 2026-08-07

### Phase Log
| Date | Phase | Status | Notes |
|------|-------|--------|-------|
| 2026-08-07 | Phase 0 | In Progress | Scaffolding repo, Docker, Knowledge Curator |

---

## Team

| Member | Role | Primary Ownership |
|--------|------|------------------|
| Ritz615 | Lead | Frontend + Auth + Document Management |
| Teammate | AI | Backend AI Pipeline + Reports |

---

## Questions / Blockers

_Record any blockers here during development._

| Date | Question | Resolution |
|------|---------|-----------|
| 2026-08-07 | GPU available for Ollama? | Pending |
| 2026-08-07 | Production LLM API key? | Pending |
