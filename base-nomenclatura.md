# Naming Conventions — Baseline

## Overview

This document defines naming conventions for personal projects. It covers JavaScript/TypeScript, environment variables, endpoints, and file structure.

Adapt as needed per project — this is a baseline, not a strict ruleset.

---

## Files and Folders

kebab-case, English.

```
✓  user-auth/
✓  api-client.js
✓  error-handler.ts
✓  process-data.js

✗  userAuth/
✗  ApiClient.js
✗  error_handler.ts
```

### Exceptions
Tool-enforced names keep their original casing:

| Term | Reason |
|------|--------|
| `package.json`, `vite.config.js`, `docker-compose.yml` | Required by tools |
| `README.md`, `Makefile` | Convention |
| `.env`, `.gitignore` | Convention |

---

## JavaScript / TypeScript

### Variables
camelCase.

```javascript
// ✓
const userData = {};
const isLoading = false;
const totalCount = 0;

// ✗
const user_data = {};
const IsLoading = false;
```

### Functions
camelCase. Name describes the action.

```javascript
// ✓
function fetchUserData(userId) {}
function calculateTotal(items) {}
function formatResponse(data) {}

// ✗
function data(id) {}
function calc(items) {}
function FetchUser(id) {}
```

### Constants
SCREAMING_SNAKE_CASE.

```javascript
// ✓
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;
const API_VERSION = 'v1';

// ✗
const maxRetryCount = 3;
const defaultTimeout = 5000;
```

### Classes
PascalCase.

```javascript
// ✓
class UserService {}
class ErrorHandler {}
class ApiClient {}

// ✗
class userService {}
class error_handler {}
```

### JSON properties (API payloads)
snake_case.

```javascript
// ✓
{
  user_id: 1,
  created_at: '2025-01-01',
  is_active: true
}

// ✗
{
  userId: 1,
  createdAt: '2025-01-01',
  isActive: true
}
```

### Boolean variables
Prefix with `is`, `has`, `should`, or `can`.

```javascript
// ✓
const isAuthenticated = true;
const hasPermission = false;
const shouldRetry = true;

// ✗
const authenticated = true;
const permission = false;
```

---

## Environment Variables

SCREAMING_SNAKE_CASE. Service/tool names in English.

```bash
# ✓
DATABASE_URL=
API_KEY=
JWT_SECRET=
GOOGLE_CLIENT_ID=
AWS_ACCESS_KEY_ID=

# ✗
databaseUrl=
api_key=
jwtSecret=
```

### `.env.example` structure
Every project must have a `.env.example` with all required variables, no real values, with a comment explaining each.

```bash
# Database
DATABASE_URL=          # PostgreSQL connection string

# Auth
JWT_SECRET=            # Random string, min 32 chars
JWT_EXPIRY=7d          # Token expiry duration

# External APIs
GOOGLE_CLIENT_ID=      # Google OAuth client ID
GOOGLE_CLIENT_SECRET=  # Google OAuth client secret
```

---

## API Endpoints

kebab-case, plural nouns for resources, English.

```
✓  GET  /api/users
✓  GET  /api/users/:id
✓  POST /api/auth/login
✓  POST /api/auth/refresh-token
✓  GET  /api/blog-posts

✗  GET  /api/getUsers
✗  POST /api/Login
✗  GET  /api/blogPosts
```

---

## Git

### Branches
kebab-case with type prefix.

```
✓  feature/user-authentication
✓  fix/login-redirect
✓  chore/update-dependencies
✓  docs/api-reference

✗  UserAuth
✗  fix_login
✗  new-feature
```

### Commits
Imperative mood, English, short and descriptive.

```
✓  Add user authentication
✓  Fix login redirect on mobile
✓  Update dependencies
✓  Remove unused imports

✗  Added user authentication
✗  fixes
✗  wip
```

---

## Quick Reference

| Context | Pattern | Language |
|---------|---------|----------|
| Files and folders | kebab-case | English |
| Variables | camelCase | English |
| Functions | camelCase | English |
| Constants | SCREAMING_SNAKE_CASE | English |
| Classes | PascalCase | English |
| JSON properties | snake_case | English |
| Environment variables | SCREAMING_SNAKE_CASE | English |
| API endpoints | kebab-case | English |
| Git branches | kebab-case with prefix | English |
