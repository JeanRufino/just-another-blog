# Project Structure — Baseline

## Overview

Two baseline structures for personal projects:

- **Fullstack Web** — React frontend + Node.js backend, monorepo
- **n8n Automation** — single or few workflows, no orchestration layer needed

Adapt as needed. These are starting points, not rigid rules.

---

## Fullstack Web (Monorepo)

```
project-name/
  frontend/
    src/
      components/
        shared/           ← reusable components
      hooks/
      pages/
      services/           ← API calls
      utils/
    public/
    package.json
    vite.config.js
    .env.example

  backend/
    src/
      routes/
      controllers/
      services/           ← business logic
      middleware/
      utils/
    package.json
    .env.example

  docs/
    architecture.md
    setup.md

  docker-compose.yml
  Makefile
  .gitignore
  README.md
  AI.md
```

### When to add `shared/` at root level
Only when frontend and backend share code (types, constants, utilities). Don't create it preemptively.

```
project-name/
  shared/
    types/
    constants/
  frontend/
  backend/
```

### Makefile pattern

```makefile
.PHONY: help dev stop clean

help:
	@echo ""
	@echo "Commands:"
	@echo "  make dev     Start frontend and backend"
	@echo "  make stop    Stop all containers"
	@echo "  make clean   Stop and remove volumes"
	@echo ""

dev:
	docker compose up -d
	cd frontend && npm install && npm run dev

stop:
	docker compose down

clean:
	docker compose down -v
```

---

## n8n Automation

For simple automations — one domain, few workflows, no need for orchestration layer.

```
project-name/
  workflows/
    main-workflow.json
    helper-workflow.json  ← if needed
  docs/
    overview.md
    setup.md
  tests/
    cases/
      happy-path.json
      edge-cases.json
    run-tests.js
  .env.example
  docker-compose.yml
  Makefile
  .gitignore
  README.md
  AI.md
```

### When to promote to full workspace-n8n structure
Move to the full monorepo structure when:
- More than one distinct business domain emerges
- A frontend interface is needed
- Multiple workflows need orchestration between them

### Makefile pattern

```makefile
.PHONY: help dev stop clean

help:
	@echo ""
	@echo "Commands:"
	@echo "  make dev     Start n8n"
	@echo "  make stop    Stop n8n"
	@echo "  make clean   Stop and remove volumes"
	@echo ""

dev:
	docker compose up -d
	@echo "n8n available at http://localhost:5678"

stop:
	docker compose down

clean:
	docker compose down -v
```

### docker-compose.yml pattern

```yaml
services:
  n8n:
    image: n8nio/n8n
    env_file: .env
    ports:
      - "5678:5678"
    volumes:
      - n8n-data:/home/node/.n8n

volumes:
  n8n-data:
```

---

## Shared Patterns (both structures)

### `.gitignore`

```
# Environment
.env
.env.local
.env.*.local

# Dependencies
node_modules/

# Build
dist/
build/

# OS
.DS_Store
Thumbs.db

# Editors
.vscode/
.idea/
```

### `README.md` structure

```markdown
# Project Name

One line description.

## Setup

1. Clone the repo
2. Copy `.env.example` to `.env` and fill in the values
3. Run `make dev`

## Available Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start the project |
| `make stop` | Stop all services |
| `make clean` | Stop and remove all data |

## Structure

Brief description of the folder structure.
```

### `AI.md` structure

```markdown
# AI.md

## About
Brief description of what the project does.

## Read first
- docs/architecture.md — system overview and key decisions
- docs/setup.md — how to run the project locally

## Key decisions
- List decisions that should not be reversed without discussion
```

---

## Decision Guide

| Situation | Structure |
|-----------|-----------|
| Simple automation, 1-3 workflows, no UI | n8n Automation |
| Automation that grew, needs UI or orchestration | Promote to workspace-n8n |
| Web app, React + API | Fullstack Web |
| Multiple unrelated projects in one repo | Not recommended — separate repos |
