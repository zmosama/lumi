# Changelog

All notable changes to the Lumi School SaaS Platform will be documented in this file.

## [Unreleased] - AI Setup Session (June 2026)

### Added
- **Multi-Tenancy Setup**: Implemented a scalable multi-tenant architecture using Prisma middleware and `AsyncLocalStorage` to enforce data isolation at the DB level.
- **Contract-First Frontend**: Set up `openapi-typescript` to dynamically generate Next.js types (`apps/web/src/types/api.generated.ts`) directly from NestJS Swagger annotations.
- **Continuous Integration (CI)**: Integrated a comprehensive GitHub Actions workflow (`.github/workflows/ci.yml`) to automatically run ESLint, TypeScript Type Checks, and Playwright End-to-End tests on push.
- **Domain-Driven Design (DDD)**: Created a `packages/domain` Turborepo package. Decoupled core business logic (`PlatformDomainService`, `TenantsDomainService`, `AttendanceDomainService`) from the NestJS controllers to establish a pure "Modular Monolith".

### Changed
- **E2E Test Stability**: Refactored Playwright security and validation tests (`security.spec.ts`, `login-validation.spec.ts`) to be completely language-agnostic using data attributes (`data-testid`) instead of brittle CSS text selectors.
- **i18n Standardization**: Synchronized backend (`nestjs-i18n`) and frontend (`next-intl`) to correctly default to `ar` (Arabic RTL) while supporting 10 languages seamlessly.
- **Frontend Tables Refactoring**: Refactored `BranchesPage` and `AddStudentModal` to strictly consume the generated `api.generated.ts` OpenAPI types instead of maintaining manual DTO replicas.
- **Next-Intl Next.js Integration**: Stabilized the App Router Next.js 14 routing interceptors to prevent infinite 401 redirect loops when authenticating.

### Fixed
- Fixed the API `I18nAbstractLoader` failure by properly configuring `next-intl` v4 in `apps/web/src/i18n/request.ts`.
- Fixed the Playwright `Next.js server failed to start` timeout by increasing the local development startup timeout.
- Fixed an issue where the Swagger Plugin for NestJS failed to detect returning schemas by properly configuring `@ApiResponse` and returning mapped DTOs.
