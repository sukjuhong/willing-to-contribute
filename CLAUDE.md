# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Pickssue" is a Next.js 15 application that helps developers discover and track beginner-friendly GitHub issues across multiple repositories. It features Supabase authentication (GitHub OAuth), cloud sync via Supabase, personalized issue recommendations with GitHub activity analysis, browser notifications, and i18n support (English/Korean).

## Development Commands

### Running the Application

```bash
npm run dev           # Start development server with Turbopack
npm run build         # Build for production
npm start             # Start production server
```

### Code Quality

```bash
npm run lint          # Run ESLint on all files
npx prettier --write . # Format all files with Prettier
npx markdownlint --fix "**/*.md" # Lint and fix markdown files
```

### Pre-commit Hook

Git commits automatically trigger `lint-staged` which runs:

- Prettier on all files
- ESLint fix on TypeScript/TSX files in `app/**`
- markdownlint fix on markdown files

## Architecture

### Application Structure

The app uses Next.js 15 App Router with route groups and Supabase authentication:

- **app/page.tsx**: Landing page with feature overview and SEO metadata
- **app/(main)/** - Route group for authenticated features:
  - **issues/page.tsx**: Browse recommended issues, filtered by language/skills
  - **picked/page.tsx**: View and manage bookmarked issues (requires auth)
- **(static)/** - Route group for static pages:
  - **about/, faq/, guide/, privacy/, terms/**: Information pages
- **app/layout.tsx**: Root layout with SEO metadata, IntlProvider wrapper, and JSON-LD structured data
- **app/api/auth/callback/**: Supabase OAuth callback handler (GitHub provider)
- **app/api/recommended**: Server endpoint for personalized issue recommendations
- **app/api/profile/analyze**: Server endpoint for GitHub profile analysis (top languages, contributions)
- **app/api/v1/score**: Maintainer scoring API
- **app/api/search**: Issue search endpoint

### State Management Pattern

The application uses a hook-based architecture coordinated via `AppContext`:

1. **useSupabaseAuth** - Supabase GitHub OAuth login/logout, session management, GitHub access token persistence
2. **useSettings** - User settings (notification frequency, hide closed issues), picked issues list, Supabase + localStorage persistence
3. **usePickedIssues** - Fetches and manages bookmarked issues, tracks state changes (open/closed), periodically refreshes status
4. **useRecommendedIssues** - Fetches personalized issue recommendations from `/api/recommended`, caches by language filter
5. **useUserProfile** - GitHub profile analysis (top languages, contributed repos), syncs weekly via `/api/profile/analyze`

Data flows:

- **Auth**: `useSupabaseAuth` → GitHub token in sessionStorage
- **Settings**: `useSettings` persists to Supabase + localStorage (fallback)
- **Picked Issues**: `usePickedIssues` depends on `useSettings` list
- **Recommended**: `useRecommendedIssues` fetches curated list (independent)
- **Profile**: `useUserProfile` auto-syncs on first login and weekly

### Key Utilities and Libraries

**GitHub & Data Fetching:**

- **app/utils/github.ts**: GitHub API interactions via Octokit (issue queries, profile analysis)
- **app/lib/github/profileAnalyzer.ts**: Analyze GitHub profile (top languages, contributed repos)
- **app/lib/cache.ts**: In-memory caching for API responses

**Authentication & Sync:**

- **app/lib/supabase/client.ts**: Supabase browser client (createClient)
- **app/lib/supabase/server.ts**: Supabase server-side client for API routes
- **app/lib/supabase/settings.ts**: User settings persistence (Supabase tables)
- **app/lib/supabase/middleware.ts**: Auth middleware for server routes

**Client Storage & Utilities:**

- **app/utils/localStorage.ts**: Client-side persistence (settings, cache, migration of legacy keys)
- **app/utils/notifications.ts**: Browser notification permission checking and display

**Environment & Configuration:**

- **app/lib/env.ts**: Validated environment variables via @t3-oss/env-nextjs

### Internationalization

Uses `next-intl` for i18n:

- Translation files: `messages/en.json`, `messages/ko.json`
- **app/providers/IntlProvider.tsx**: IntlProvider wrapper from next-intl
- **useTranslations()** hook: i18n function imported from `next-intl` (used in client components)

### Components

All UI components are in `app/components/` (shadcn/ui + Radix UI primitives):

**Layout & Navigation:**

- **Header.tsx**: Navigation, auth status, language switcher
- **Navigation.tsx**: Tabs/menu navigation between Issues and Picked sections
- **Footer.tsx**: Site footer
- **AdSidebar.tsx**: Google AdSense sidebar

**Auth & User:**

- **LoginPrompt.tsx**: Call-to-action for GitHub login
- **ProfileAnalysisModal.tsx**: Display user profile analysis (top languages, contributions)

**Issue Display:**

- **IssueItem.tsx**: Individual issue card (recommended) with labels, metadata, pick/unpick button
- **PickedIssueItem.tsx**: Bookmarked issue card with state, custom tags, unpick button
- **RecommendedIssues.tsx**: Main issues feed with language filter, recommendations display

**Filtering & Settings:**

- **IssueFilters.tsx**: Language/label filtering for recommendations

## Environment Configuration

Required for full functionality:

```bash
# .env.local (Public - loaded in client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_anon_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000          # Optional, for canonical URLs
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxx           # Optional, for Google AdSense
NEXT_PUBLIC_ADSENSE_SLOT_ID=xxx                     # Optional, for Google AdSense

# .env.local (Server-only)
GITHUB_APP_ID=your_github_app_id                    # Optional, for GitHub App auth
GITHUB_APP_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----... # Optional
GITHUB_APP_INSTALLATION_ID=your_installation_id     # Optional
```

Supabase must be configured with:

- GitHub OAuth provider (for sign-in)
- `user_profiles`, `user_settings` tables (see supabase/migrations/)
- Public schema for RLS policies

## Code Style

### TypeScript Configuration

- Path alias: `@/*` maps to project root
- Strict mode enabled
- Target: ES2017

### Prettier Settings (notable non-defaults)

- Print width: 90
- Single quotes
- Arrow parens: avoid
- Prose wrap: never

### ESLint

Uses Next.js recommended configs:

- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

## Technologies

- **Next.js 15** (App Router, React Server Components)
- **React 19**
- **TypeScript**
- **TailwindCSS 4** for styling
- **shadcn/ui** + **Radix UI** for UI components (replaced DaisyUI)
- **Supabase** (@supabase/supabase-js, @supabase/ssr) for auth and database
- **Octokit** (@octokit/rest, @octokit/auth-app) for GitHub API
- **SWR** for client-side data fetching
- **next-intl** for internationalization
- **Upstash Redis** (@upstash/redis) for distributed caching
- **react-icons** for icon library
- **Lucide React** for additional icons

## Issue & Roadmap Management

### Priority Labels

- `P0: now` — 즉시 실행. 고유 가치 생성, 의존성 없음
- `P1: next` — 다음 차례. P0 완료 후 또는 병렬 가능
- `P2: later` — 전제조건 미충족 (사용자 수, 인프라, 의사결정 필요)
- `P3: revisit` — 효과 불확실, 재검토 필요

### Scope Labels

- `scope: unique-data` — Pickssue 고유 데이터 (GitHub에 없는 것)
- `scope: infra` — 후속 기능의 전제조건
- `scope: retention` — 재방문 유도
- `scope: seo` — 검색 유입

### Feature-based Milestones

마일스톤은 기간이 아닌 기능 단위로 구성:

- 데이터 인프라 / 개인화 & 매칭 / 큐레이션 콘텐츠 / 기여 추적
- 소셜 & 커뮤니티 / 게이미피케이션 / 프로필 & 공유 / SEO & i18n

### Prioritization Principles

1. **고유 데이터 우선**: GitHub 정보 복제보다 Pickssue만의 데이터를 만드는 기능이 우선
2. **SEO는 고유 데이터 확보 후**: 현재 /issues는 CSR이라 크롤러가 빈 HTML만 봄. SSR 전환 + 고유 콘텐츠가 선행되어야 SEO 효과 있음
3. **소셜 기능은 DAU 기반 게이팅**: 빈 피드/리더보드는 역효과. 최소 사용자 임계치 도달 후 활성화
4. **새 이슈 생성 시**: 반드시 P0~P3 우선순위 + scope 라벨 부여

## Important Notes

- Authentication requires Supabase with GitHub OAuth provider configured
- GitHub access token from Supabase OAuth is stored in sessionStorage (not persisted across browser restart)
- Settings and picked issues sync via Supabase database (with localStorage fallback when offline)
- User profiles auto-sync on first login and weekly thereafter
- Recommended issues caching uses localStorage + optional Upstash Redis for distributed caching
- Browser notifications require explicit user permission (checked on app load)
- Notification checks run on intervals (hourly, 6-hourly, daily) based on user preference
- Issue state tracking periodically fetches from GitHub API to detect status changes (open/closed/assignee)
- SSR: Landing page (/) and static pages are server-rendered; authenticated pages (/issues, /picked) use CSR
