# Technical Assignment: Dockerized Secure Task Manager

## Candidate

Sostene Ngarukiyimana

## Timebox

Please spend no more than **2 days** on this assignment.

We value clear engineering decisions, working fundamentals, security awareness, and documentation more than feature completeness. If something is incomplete, document what is missing, why it is missing, and how you would finish it with more time.

---

## Objective

Build a Dockerized full-stack **Team Task Manager** application that demonstrates your ability to design, build, secure, containerize, and document a real application.

The application should demonstrate:

- Frontend and backend development
- Authentication using an identity provider
- Secure API design
- PostgreSQL database usage
- Redis cache or session usage
- Docker and Docker Compose
- PostgreSQL backup and restore using `pg_dump`
- Basic analytics and visualization
- Responsible use of AI tools during development

---

## Product Brief

Create a small task management application where authenticated users can manage their own tasks.

A user should be able to:

1. Log in using Keycloak
2. Log out
3. View their profile information from Keycloak
4. Create tasks
5. View tasks
6. Update tasks
7. Delete tasks
8. Mark tasks as `todo`, `in_progress`, or `done`
9. View a dashboard with task analytics and visualizations
10. Access only their own tasks and analytics

---

## Required Stack

You may choose the backend and frontend framework, but the final solution must include the following services:

- Frontend application
- Backend API
- PostgreSQL
- Redis
- Keycloak
- Docker Compose

### Acceptable Backend Options

You may use one of the following, or another reasonable backend framework:

- Node.js with Express or NestJS
- Python with Django or FastAPI
- Java with Spring Boot

### Acceptable Frontend Options

You may use one of the following, or another reasonable frontend framework:

- React
- Next.js
- Angular
- Vue

---

## Core Functional Requirements

### Authentication

Use **Keycloak** as the identity provider.

Minimum expected setup:

- A Keycloak realm, for example `task-manager`
- A frontend client
- Backend token validation
- At least two test users:
  - `admin@example.com`
  - `user@example.com`

The application does not need complex role-based access control, but role-based functionality is a bonus.

### Task Management

Each task should include at least:

```text
id
title
description
status
owner_id
created_at
updated_at
```

Valid task statuses:

```text
todo
in_progress
done
```

Optional fields that can improve the dashboard:

```text
priority: low | medium | high
due_date
completed_at
```

### API Requirements

The backend should expose protected API endpoints similar to:

```http
GET    /api/me
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

All `/api/*` routes must require authentication.

The backend must ensure that one user cannot access another user's tasks.

---

## Visualization and Analytics Requirement

The application must include a dashboard page.

Suggested route:

```text
/dashboard
```

The dashboard should include at least **3 meaningful analytics views** based on real PostgreSQL task data.

Minimum expected visualizations:

1. **Tasks by status**
   - Example: `todo`, `in_progress`, `done`
   - Recommended chart: bar chart or pie chart

2. **Tasks created over time**
   - Example: number of tasks created per day
   - Recommended chart: line chart or bar chart

3. **User productivity summary**
   - Example:
     - total tasks
     - completed tasks
     - in-progress tasks
     - completion percentage

Optional visualizations:

- Tasks by priority
- Completed vs overdue tasks
- Average completion time
- Tasks due soon

### Analytics API Endpoints

Create protected analytics endpoints such as:

```http
GET /api/analytics/tasks-by-status
GET /api/analytics/tasks-created-over-time
GET /api/analytics/summary
```

All analytics must be scoped to the logged-in user.

A user should not be able to see another user's analytics.

---

## Redis Requirement

Use Redis for at least one meaningful purpose.

Acceptable Redis use cases include:

- Session storage
- User profile cache
- Token/session cache
- Rate limiting
- Caching task analytics
- Caching task summary counts

You should document:

- What Redis is used for
- Why Redis is useful in that part of the application
- How we can verify Redis is being used

---

## PostgreSQL Requirement

Use PostgreSQL as the main application database.

The database should store:

- User-owned tasks
- Any additional data required by the application

You should include either:

- Database migrations, or
- A clear schema initialization process

Data should persist across container restarts.

---

## Backup and Restore Requirement

Include a script or documented command for backing up PostgreSQL using `pg_dump`.

Suggested script:

```bash
./scripts/backup-db.sh
```

Expected backup output example:

```text
backups/task-manager-YYYY-MM-DD.sql
```

Also include a restore script or documented restore command.

Suggested script:

```bash
./scripts/restore-db.sh backups/example.sql
```

The README must explain how to perform both backup and restore.

---

## Docker Compose Requirement

The full application should run with:

```bash
docker compose up --build
```

Expected services:

```text
frontend
backend
postgres
redis
keycloak
```

Optional service:

```text
pgadmin
```

The setup should not require hidden manual steps. If a manual step is required, it must be clearly documented.

---

## AI Usage Requirement

AI tools are allowed for this assignment.

However, we want to understand how you use AI as an engineer.

Please include a file named:

```text
AI_USAGE.md
```

This file should answer:

1. Which AI tools did you use?
2. What parts of the assignment did you use AI for?
3. What prompts were most useful?
4. What AI-generated code did you accept?
5. What AI-generated code did you reject or modify?
6. What security or correctness checks did you personally perform?
7. What would you improve with one more day?

Please include at least **3 real prompt examples** you used.

We are not judging whether you used AI. We are judging whether you used it responsibly.

---

## Suggested Repository Structure

```text
task-manager-assignment/
  README.md
  AI_USAGE.md
  docker-compose.yml
  .env.example

  frontend/
    Dockerfile
    src/

  backend/
    Dockerfile
    src/
    migrations/

  scripts/
    backup-db.sh
    restore-db.sh

  docs/
    architecture.md
    screenshots/
```

---

## README Requirements

Your `README.md` should include:

1. Project overview
2. Architecture explanation or diagram
3. Setup instructions
4. Test user credentials
5. Environment variables
6. API documentation
7. Dashboard and visualization explanation
8. Redis usage explanation
9. Backup and restore instructions
10. Known limitations
11. AI usage summary

---

## Submission Requirements

Please submit:

1. Push GitHub main branch
2. Short walkthrough
3. Screenshot of successful Keycloak login
4. Screenshot of task CRUD functionality
5. Screenshot of the dashboard/visualizations
6. Screenshot or logs proving Redis is being used
7. Screenshot or terminal output showing successful `pg_dump`
8. `AI_USAGE.md`

---

## Evaluation Rubric

Total: **110 points**

### 1. Docker and Local Setup — 20 points

| Criteria | Points |
|---|---:|
| `docker compose up --build` works | 6 |
| Includes frontend, backend, PostgreSQL, Redis, and Keycloak | 5 |
| Sensible environment variable handling | 3 |
| Clear setup documentation | 3 |
| Services restart cleanly | 3 |

### 2. Authentication with Keycloak — 20 points

| Criteria | Points |
|---|---:|
| Frontend login/logout works | 4 |
| Backend validates Keycloak tokens | 5 |
| Protected APIs reject unauthenticated requests | 4 |
| User identity is correctly mapped to tasks | 4 |
| Keycloak setup is documented or importable | 3 |

### 3. Backend Quality — 15 points

| Criteria | Points |
|---|---:|
| Clean API design | 3 |
| Correct task CRUD behavior | 4 |
| Proper user-level data isolation | 4 |
| Input validation and error handling | 2 |
| Code organization | 2 |

### 4. Frontend Quality — 10 points

| Criteria | Points |
|---|---:|
| Login flow is usable | 3 |
| Task UI works end-to-end | 4 |
| Handles loading and error states | 2 |
| Basic clean UX | 1 |

### 5. PostgreSQL and Backup — 10 points

| Criteria | Points |
|---|---:|
| Proper schema or migrations | 3 |
| Data persists across restarts | 2 |
| `pg_dump` backup works | 3 |
| Restore process is documented or scripted | 2 |

### 6. Redis Usage — 10 points

| Criteria | Points |
|---|---:|
| Redis is actually integrated | 4 |
| Redis has a meaningful purpose | 3 |
| Candidate can explain why Redis was used | 2 |
| Handles Redis failure reasonably | 1 |

### 7. Visualization and Analytics — 10 points

| Criteria | Points |
|---|---:|
| Dashboard page exists | 2 |
| Shows at least 3 meaningful charts/cards | 3 |
| Analytics are based on real PostgreSQL data | 2 |
| Analytics respect logged-in user scope | 2 |
| Charts are readable and useful | 1 |

### 8. AI Usage and Engineering Judgment — 15 points

| Criteria | Points |
|---|---:|
| Clear `AI_USAGE.md` | 3 |
| Provides real prompt examples | 2 |
| Shows evidence of reviewing AI-generated code | 3 |
| Documents rejected or modified AI suggestions | 2 |
| Uses AI to accelerate, not blindly replace thinking | 3 |
| Documents tradeoffs and next steps | 2 |

---

## Bonus Points

| Bonus | Points |
|---|---:|
| Role-based access using Keycloak roles | +5 |
| Automated tests | +5 |
| GitHub Actions CI | +5 |
| Keycloak realm import file included | +5 |
| API docs using Swagger/OpenAPI | +3 |
| Health checks for services | +3 |
| Clean architecture diagram | +2 |

---

## Final Notes

We are looking for practical engineering judgment.

A good submission should be easy to run, easy to understand, and honest about tradeoffs.

Please focus on:

- Security basics
- Correct authentication flow
- Clean Docker setup
- Clear documentation
- Real Redis usage
- Real PostgreSQL persistence
- Useful dashboard visualizations
- Responsible AI-assisted development
