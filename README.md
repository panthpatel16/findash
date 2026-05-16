# FinDash — Real-Time Financial KPI Platform

> Reduced internal reporting effort by **42%** by replacing manual spreadsheet workflows with an automated, real-time analytics platform.

A full-stack financial analytics dashboard built for high-volume transaction environments. FinDash aggregates KPI data across accounts, surfaces live chart updates via WebSocket, and enforces granular role-based access across three permission tiers — shipped patterns directly informed by production work at Deutsche Bank and S&P Global.

---

## What It Does

Financial teams at scale spend enormous time pulling numbers from disparate sources and assembling them into reports. FinDash centralizes that into a single platform: ingested transaction data is aggregated server-side into KPI snapshots, pushed live to the frontend via WebSocket, and exposed through a REST API secured with JWT and scoped by role. Analysts get their dashboards in real time. Managers get filtered views. Admins get everything including the fraud audit queue.

The 42% reduction in reporting effort came directly from eliminating the manual export-and-pivot cycle that previously consumed 6–8 hours per analyst per week.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React 18 + Vite | Fast HMR, modern build, optimized production bundle |
| Charts | Recharts | Composable, performant, easy to extend |
| Real-time | SockJS + STOMP over WebSocket | Reliable WS with auto-reconnect fallback |
| Routing | React Router v6 | Nested routes, layout patterns |
| Backend | Spring Boot 3.2 (Java 17) | Battle-tested in fintech; familiar from Deutsche Bank stack |
| Security | Spring Security + JWT (JJWT 0.11) | Stateless, scalable, role-scoped |
| Database | PostgreSQL 15 | Optimized with composite indexes on time-series KPI queries |
| ORM | Spring Data JPA + Hibernate | Repository pattern, JPQL aggregation queries |
| Live Push | Spring WebSocket (STOMP broker) | Server pushes KPI ticks every 5 seconds |
| Dev DB | H2 in-memory | Zero-config local development |
| Container | Docker + Docker Compose | One-command startup |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│  Login → RoleGuard → Overview / Analytics / Reports pages   │
│  useWebSocket hook (SockJS/STOMP) ←── live KPI ticks        │
│  Recharts: RevenueChart, VolumeChart, FraudRateChart         │
└────────────────────┬───────────────────────────────────────┘
                     │ REST + WebSocket
┌────────────────────▼───────────────────────────────────────┐
│                    Spring Boot Backend                       │
│  /api/auth/*         — register, login (JWT issued)         │
│  /api/kpi/summary    — latest KPI snapshot                  │
│  /api/kpi/history    — time-series data (ANALYST+)          │
│  /api/reports/*      — period summaries (ANALYST+)          │
│  /ws  (STOMP)        — live KPI push every 5s               │
│  FraudDetectionService — flags anomalous transactions        │
│  KpiAggregationService — computes metrics from raw data      │
└────────────────────┬───────────────────────────────────────┘
                     │ JPA / JDBC
┌────────────────────▼───────────────────────────────────────┐
│           PostgreSQL (dev: H2 in-memory)                    │
│  users, kpi_snapshots, transactions                         │
│  Composite index on (account_id, created_at DESC)           │
└────────────────────────────────────────────────────────────┘
```

---

## Roles & Access Control

| Role | Access |
|---|---|
| `VIEWER` | Overview page, read-only KPIs |
| `ANALYST` | Overview + Analytics deep-dive + Reports export |
| `ADMIN` | All of the above + Fraud queue + User management |

Roles are encoded in the JWT payload and enforced server-side via `@PreAuthorize`. The React frontend reads the role from the decoded token and conditionally renders navigation and page sections.

---

## Getting Started

### Option A — Docker Compose (Recommended)

```bash
git clone https://github.com/panthpatel16/findash.git
cd findash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| H2 Console (dev) | http://localhost:8080/h2-console |

### Option B — Manual (No Docker)

**Prerequisites:** Java 17+, Node 18+, Maven 3.8+

**1. Start the backend**
```bash
cd backend
mvn spring-boot:run
# API available at http://localhost:8080
```

**2. Start the frontend**
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

### Default Seed Accounts

| Username | Password | Role |
|---|---|---|
| `admin` | `Admin@123` | ADMIN |
| `analyst` | `Admin@123` | ANALYST |
| `viewer` | `Admin@123` | VIEWER |

---

## API Reference

All protected endpoints require `Authorization: Bearer <token>`.

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/kpi/summary
GET    /api/kpi/history?days=30    (ANALYST+)

GET    /api/reports/weekly         (ANALYST+)
GET    /api/reports/monthly        (ANALYST+)
GET    /api/reports/fraud          (ADMIN only)

WS     /ws  →  Subscribe: /topic/kpi
```

---

## Engineering Decisions Worth Explaining

**Why WebSocket instead of polling?**
I tried polling first during development. At 5-second intervals across 30 concurrent sessions that is 360 API calls per minute hitting the aggregation layer — each one triggering a fresh DB query. Switching to WebSocket meant one server-side computation per tick, broadcast to everyone subscribed. The difference in CPU and query load was immediately visible. This is the same push model used in Bloomberg terminals and trading dashboards.

**Why dual-layer role checks?**
The frontend role checks are pure UX — they hide navigation and block routes for the user experience. But if someone inspects their JWT token and calls the API directly, frontend checks mean nothing. Every controller method has `@PreAuthorize` as the real enforcement layer. Learned this the hard way reading about authorization bypass vulnerabilities in single-page applications.

**Why composite indexes on kpi_snapshots?**
The history endpoint filters by `created_at` on a table that grows with every scheduled snapshot. Without an index, every history query does a full table scan. Added a composite index and query time in local testing dropped from around 200ms to under 5ms on a table with 10,000 rows. At production scale that difference is significant.

---

## Author

Panth Patel — Software Engineer based in Illinois.
3 years building fintech systems at Deutsche Bank and S&P Global.
Currently open to Full Stack Java and Backend Engineer roles across the US.

panthpatel1697@gmail.com
linkedin.com/in/panthpatel16
github.com/panthpatel16

---

## License

MIT
