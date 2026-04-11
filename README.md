# Online Assessment Platform

Full-stack **online assessment** app: an **Admin (Employer)** panel to create and manage tests, and a **User (Candidate)** panel to take timed exams. Built with **Next.js (App Router)** and **Supabase** for auth and data.

---

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech stack](#tech-stack)
4. [Architecture](#architecture)
5. [Additional capabilities](#additional-capabilities)
6. [Roadmap / not implemented](#roadmap--not-implemented)
7. [Getting started](#getting-started)
8. [Environment variables](#environment-variables)
9. [Scripts](#scripts)
10. [Project structure](#project-structure)

---

## Overview

| Panel | Routes | Purpose |
|--------|--------|---------|
| **Admin** | `/admin` | Login, list tests, create/edit exams, manage questions, view candidates and attempts |
| **User** | `/user` | Register/login, browse published tests, take exams, view submission history |

**Data layer:** Next.js **Route Handlers** (`src/app/api/*`) and **Supabase** (Postgres + Auth). Server-side exam writes use the **service role** key (never exposed to the client).

---

## Features

### Admin

- **Login** — `/admin/login` — email/password via env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) and session cookie; redirect to `/admin`.
- **Dashboard** — `/admin` — tests as **cards** (title, candidates, question sets, slots); **View Candidates** → `/admin/tests/[examId]/users`.
- **Create / edit test (multi-step)**  
  - Basic info — `/admin/tests/new` — title, candidates, slots, question sets, question type, start/end time, duration (`BasicInfoForm`).  
  - Questions — `/admin/tests/new/questions` — add/edit/delete in a **modal** (`question-modal.tsx`) — types: **Radio**, **Checkbox**, **Text**.  
  - Review — `/admin/tests/new/review`.

### User

- **Auth** — `/user/login`, `/user/register` (Supabase).
- **Dashboard** — `/user` — cards with duration, question count, negative marking, **Start** → `/user/exam/[examId]`.
- **Exam** — `UserExamRunner` — one question at a time, **countdown**, **auto-submit on timeout**, complete via **Save & Continue** on the last question; results posted to the API.

### Stack choices (libraries)

- **Next.js 16**, **React 19**, App Router  
- **Zustand** — user exam session only (`user-exam-session-store.ts`); other UI uses React local state  
- **Tailwind CSS v4**, **Lucide**, **react-toastify**  
- **Axios** (some flows) and **fetch** (others); no React Query  
- Forms are **controlled components** (no React Hook Form / Zod in this repo)

---

## Tech stack

- Next.js, TypeScript, Tailwind CSS  
- Supabase (`@supabase/ssr`, `@supabase/supabase-js`)  
- Zustand, Axios, Lucide React  

---

## Architecture

- **`middleware.ts`** — guards `/admin/*` (except login) and `/user/*` (except login/register); Supabase session cookies when configured.  
- **API** — e.g. `POST /api/exams/[id]/submit` persists scores and `exam_attempts`; CRUD under `/api/exams/*`; auth under `/api/auth/*`.  
- **Persistence** — Supabase when `SUPABASE_SERVICE_ROLE_KEY` is set; mocks/fallbacks in dev if unset.

---

## Additional capabilities

- **`/user/profile`** — signed-in user’s past attempts (scores, dates); link **“My test results”** in the header.  
- **MCQ locking** — radio: choice is final; checkbox: can add checks, cannot uncheck a selected option.  
- **SQL migrations** — `supabase/migrations/` (e.g. `exam_attempts`, indexes).

---

## Roadmap / not implemented

- Proctoring-style **tab visibility** / **fullscreen exit** tracking (not wired).  
- **Offline** handling (`online`/`offline`, queued submit, local persistence) — not implemented.  
- Optional stack items you might add later: React Hook Form + Zod, React Query, ShadCN UI.

---

## Getting started

```bash
npm install
cp .env.example .env   # fill values; never commit secrets
```

Apply SQL in `supabase/migrations/` to your Supabase project (CLI or SQL editor).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin: **`/admin/login`**. User: **`/user/login`**.

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin login |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** — DB writes for exams/attempts |

Details: **`.env.example`**.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

---

## Project structure

```text
src/
  app/           # Pages + API routes
  components/    # admin, user, layout, auth
  lib/           # persistence, scoring, Supabase
  stores/        # Zustand (user exam session)
  types/
supabase/migrations/
middleware.ts
```

---

## License

Private / proprietary — adjust for your use case.
