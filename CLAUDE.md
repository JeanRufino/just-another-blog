# CLAUDE.md

## Project

Personal site for Jean Rufino — developer portfolio and blog (SCREAMING_SNAKE_CASE).
Built with Next.js 15, React 19, TypeScript, Tailwind CSS. Deployed on Vercel.

## Commands

```bash
npm run dev      # dev server on port 3000
npm run build    # production build
npm run lint     # lint
```

## Structure

```
app/
  layout.tsx          # root layout, metadata
  page.tsx            # home route → renders HomePage
  globals.css         # tailwind directives
  api/
    health/route.ts   # GET /api/health — serverless function

components/
  HomePage.tsx        # scroll-snap landing page ('use client')
  NavDots.tsx         # fixed side navigation with SVG icons ('use client')
```

## Key conventions

- Follows `base-nomenclatura.md`: kebab-case files, camelCase vars, PascalCase components, SCREAMING_SNAKE_CASE constants
- Components with hooks or browser APIs must have `'use client'` at the top
- API routes live in `app/api/` — no separate Express backend
- API JSON payloads use snake_case properties
- Git commits: imperative mood, English (`Add hero section`, not `Added...`)
- Git branches: `feature/`, `fix/`, `chore/` prefixes

## Design

- Color palette: black → `#021a0a` (very dark green)
- Landing page: full-viewport scroll-snap sections, no header
- Navigation: fixed right-side SVG icon dots with diagonal wave gradient animation when active
- `imageRendering: pixelated` for any pixel art assets

## Current sections

| Index | ID    | Description         |
|-------|-------|---------------------|
| 0     | hero  | `</>` on gradient   |
| 1     | about | About — placeholder |
| 2     | blog  | SCREAMING_SNAKE_CASE blog — placeholder |

## Infrastructure

| Layer        | Technology                                              |
|--------------|---------------------------------------------------------|
| Framework    | Next.js 15 (App Router)                                 |
| Hosting      | Vercel                                                  |
| Database     | Supabase (PostgreSQL)                                   |
| DNS          | Hostinger                                               |
| E-mail       | Hostinger (contato@jeanrufino.com)                      |
| E-mail send  | Nodemailer with Gmail                                   |
| Admin auth   | httpOnly cookie signed with HMAC-SHA256 (`ADMIN_SECRET`), credentials via env (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) |

### Admin area (`/cha-de-panela/admin`)

Scoped exclusively to the chá de panela feature — there is no top-level `/admin` route.

- `middleware.ts` — protects `/cha-de-panela/admin/*` and `/api/cha-de-panela/admin/*`; redirects to `/cha-de-panela/admin/login` if cookie missing or invalid
- `lib/admin-auth.ts` — `signSession` / `verifySession` using Web Crypto API (edge-compatible)
- `app/cha-de-panela/admin/login/page.tsx` — password-only form (email is fixed via env; no email field shown)
- `app/api/cha-de-panela/admin/login/route.ts` — POST, validates password against `ADMIN_PASSWORD`, sets httpOnly cookie
- `app/api/cha-de-panela/admin/logout/route.ts` — POST, clears cookie
- `app/api/cha-de-panela/admin/presentes/route.ts` — protected GET/POST/PUT/DELETE for gift list management
- `app/cha-de-panela/admin/page.tsx` — CRUD dashboard; preco field uses bank-style input mask (digits only, auto-decimal)

## Notes

- `base-estrutura-projeto.md` and `base-nomenclatura.md` are Jean's personal baseline docs — consult them for structural and naming decisions
- NavDots icon order maps 1:1 to section index (AIIcon → StackIcon → QuestionMarkIcon)
- PostCSS config must use `module.exports`, not `export default` (Next.js requirement)
