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

## Notes

- `base-estrutura-projeto.md` and `base-nomenclatura.md` are Jean's personal baseline docs — consult them for structural and naming decisions
- NavDots icon order maps 1:1 to section index (AIIcon → StackIcon → QuestionMarkIcon)
- PostCSS config must use `module.exports`, not `export default` (Next.js requirement)
