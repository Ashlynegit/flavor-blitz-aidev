
# 🍔 Flavor Blitz

**AI-native ordering infrastructure for African food businesses.**

Flavor Blitz is a full-stack restaurant ordering platform — built as a hands-on DevOps and software engineering project, now evolving into a real product aimed at a real problem: small African food businesses need simple, affordable digital ordering.

> **Status:** Early-stage prototype, actively in development. Not a demo shell — real services, real database, real containers.

---

## What's built

| Layer | Tech |
|---|---|
| Frontend | HTML / CSS / JavaScript — menu, cart, simulated checkout |
| Menu Service | Python (Flask) + PostgreSQL — `/api/menu`, `/health` |
| Order Service | Node.js (Express) + PostgreSQL — `/api/orders`, server-side pricing |
| Database | PostgreSQL (raw SQL, no ORM) |
| Containerization | Docker + Docker Compose (per-service Dockerfiles, healthchecks) |
| Payments | Simulated checkout (Luhn-validated), designed to swap in a real gateway |

Two backend services are deliberately separate microservices — the order service never touches menu data directly, it calls the menu service over HTTP for authoritative prices and recalculates totals server-side.

## Where it's going

Flavor Blitz started as a DevOps portfolio project. Building it surfaced a bigger question: how do small food businesses in Africa accept digital orders without expensive technology?

**Roadmap:**
- ✅ Working ordering prototype (frontend + two backend microservices + Postgres)
- ✅ Dockerized, container-per-service architecture
- 🔜 Public deployment, CI/CD, observability
- 🔜 **Gemini-powered conversational ordering** — natural-language and voice
- 🔜 WhatsApp ordering integration
- 🔜 Local-language ordering (Shona, Ndebele)
- 🔜 AI-driven demand forecasting and stock insights
- 🔜 Kubernetes + Helm for multi-restaurant scale

## Why this project

This isn't "add AI to an app." The goal is to prove a genuinely useful AI-native workflow for a real operational problem — restaurant ordering — in a market (African SMEs) that's usually underserved by existing restaurant tech.

Built solo, end-to-end: frontend, two backend services, database design, containerization, and (next) CI/CD and cloud deployment.

## Running locally

```bash
git clone https://github.com/Ashlynegit/devops-production-platform.git
cd devops-production-platform
docker compose up --build
```

Frontend: `http://localhost:3000` (or configured port)
Menu API: `http://localhost:5000/api/menu`
Order API: `http://localhost:4000/api/orders`

---

📍 Harare, Zimbabwe · Built by [Ashlyne](https://github.com/Ashlynegit)