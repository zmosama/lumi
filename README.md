# Lumi School SaaS Platform

Lumi is a comprehensive, multi-tenant SaaS platform built for educational institutions (Schools, Private Tutors, Centers). It provides a unified system to manage students, branches, attendance, and finance.

## 🏗️ Architecture: Modular Monolith

The application follows a **Domain-Driven Design (DDD)** approach within a Turborepo monorepo structure.

### Project Structure
- `apps/web`: Next.js 14 App Router (Frontend)
- `apps/api`: NestJS (Backend API)
- `packages/domain`: Core Domain Business Logic (Pure TypeScript, framework agnostic)

### Tech Stack
- **Frontend**: Next.js 14, React Query, TailwindCSS, `next-intl` (i18n, RTL support), Zod
- **Backend**: NestJS, Prisma ORM, PostgreSQL, Swagger (OpenAPI)
- **Tooling**: Turborepo, pnpm, Playwright (E2E), GitHub Actions (CI/CD)

## 🌟 Key Features

1. **Multi-Tenancy**: Data is strictly isolated using `AsyncLocalStorage` in the backend. Each request is scoped to its tenant without polluting the query logic.
2. **Contract-First Frontend**: The Next.js frontend generates its API types directly from the NestJS Swagger docs (`api.generated.ts`), ensuring 100% type-safety across the network boundary.
3. **Domain-Driven Design**: Core logic is extracted into `packages/domain`. The NestJS API acts only as a transport layer.
4. **Internationalization (i18n)**: Fully supported English and Arabic (RTL) using `next-intl` on the frontend and `nestjs-i18n` on the backend.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- pnpm
- PostgreSQL running locally or via Docker

### Installation

```bash
# Install dependencies
pnpm install

# Setup environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Run Prisma migrations
cd apps/api && pnpm prisma migrate dev
```

### Running the App

```bash
# Start both Web and API concurrently
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:3001
- API Swagger Docs: http://localhost:3001/api/docs

## 🧪 Testing

```bash
# Run Playwright E2E Tests
npx playwright test
```

## 🤖 CI/CD
This repository is equipped with GitHub Actions (`.github/workflows/ci.yml`) which runs automatically on push to ensure code quality, type-safety, and E2E test passing.