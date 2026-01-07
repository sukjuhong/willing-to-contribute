# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Willing to Contribute" is a Next.js 15 application that helps developers discover and track beginner-friendly GitHub issues across multiple repositories. It features GitHub OAuth authentication, cross-device syncing via GitHub Gists, browser notifications, and i18n support (English/Korean).

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

The app uses Next.js 15 App Router with client-side state management:

- **app/page.tsx**: Main application entry point - manages tabs (Issues/Repositories/Settings), coordinates between hooks, and handles GitHub OAuth callback
- **app/layout.tsx**: Root layout with SEO metadata, LanguageProvider wrapper, and JSON-LD structured data
- **app/api/github/**: Next.js API routes for GitHub OAuth token exchange (keeps secrets server-side)

### State Management Pattern

The application uses a hook-based architecture where `page.tsx` coordinates three main custom hooks:

1. **useGithubAuth** - GitHub OAuth login/logout, token management, user info
2. **useSettings** - Repository list, notification preferences, Gist sync, localStorage persistence
3. **useIssues** - Fetches issues from tracked repositories using GitHub API (via Octokit), applies label filters

Data flows: `useSettings` → `useIssues` (settings determine which repos/labels to fetch)

### Key Utilities

- **app/utils/github.ts**: All GitHub API interactions via Octokit (repository fetching, issue queries, Gist save/load)
- **app/utils/localStorage.ts**: Client-side persistence for settings, auth tokens
- **app/utils/notifications.ts**: Browser notification permission and display

### Internationalization

Custom i18n implementation without external library:

- Translation files: `messages/en.json`, `messages/ko.json`
- **app/contexts/LanguageContext.tsx**: Language state (stored in localStorage)
- **app/hooks/useTranslation.ts**: `t(key, params)` function with dot notation path lookup

### Components

All UI components are in `app/components/`:

- **Header.tsx**: Navigation, auth status, language switcher
- **AddRepositoryForm.tsx**: Add repositories by URL or owner/name
- **RepositoryItem.tsx**: Display tracked repository with removal option
- **RepositoryIssueList.tsx**: Issue list with filtering/sorting
- **IssueItem.tsx**: Individual issue card with labels, metadata
- **SettingsPanel.tsx**: Notification frequency, custom labels, hide closed issues
- **SyncModal.tsx**: Gist sync conflict resolution UI

## Environment Configuration

Required for GitHub OAuth features (optional for basic usage):

```bash
# .env.local
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000
```

Without these, the app runs in anonymous mode with GitHub API rate limits.

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
- **TailwindCSS 4** + **DaisyUI** for UI components
- **Octokit** (@octokit/rest) for GitHub API
- **SWR** for client-side data fetching (not heavily used, mostly direct Octokit calls)

## Important Notes

- All code is client-side (`'use client'` in page.tsx) due to state management needs
- GitHub API calls use authenticated Octokit when token available, anonymous otherwise
- Settings sync via private GitHub Gist (requires OAuth)
- Browser notifications require user permission (requested on settings change)
