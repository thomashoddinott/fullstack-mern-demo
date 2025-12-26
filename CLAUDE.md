# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fullstack BJJ (Brazilian Jiu-Jitsu) academy management application built with the MERN stack (MongoDB, Express, React, Node.js). The application allows users to view classes, book sessions, manage subscriptions, and contact the academy.

## Development Setup

### Running the Application

The development environment requires three separate terminal sessions:

**Frontend** (shell 1):

```bash
cd frontend
npm run dev
```

**Database** (shell 2):

```bash
cd backend
docker compose down --volumes  # Reset database if needed
docker compose up -d
```

**Backend** (shell 3):

```bash
cd backend
npm run dev
```

The frontend runs on `http://localhost:5173` (Vite dev server) and proxies API requests to the backend at `http://localhost:8000`.

### Database Access

MongoDB runs in Docker as `bjj-mongo` on port 27017. To inspect the database:

```bash
docker exec -it bjj-mongo mongosh
```

Or use the VSCode DocumentDB extension.

## Architecture

### Backend Structure

The backend is a monolithic Express.js application in [backend/src/server.js](backend/src/server.js). All API routes, database logic, and middleware are in this single file (~347 lines).

**Key Backend Patterns:**

- Direct MongoDB driver usage (no ORM/ODM like Mongoose)
- Database: `bjj_academy` with collections: `users`, `user-avatars`, `plans`, `classes`, `teachers`, `scheduledClasses`
- Numeric IDs for all entities (not MongoDB ObjectIds)
- File uploads handled with Multer (memory storage, 5MB limit)
- Email contact form using Nodemailer (credentials in `.env`)
- Database initialization via [backend/docker/init.js](backend/docker/init.js) - generates 200 scheduled classes programmatically

**API Endpoints:**

- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/avatar` - Get user avatar (returns image/jpeg)
- `PUT /api/users/:id/avatar` - Upload user avatar (multipart/form-data)
- `GET /api/users/:id/booked-classes-id` - Get user's booked class IDs
- `PUT /api/users/:id/booked-classes` - Update user's booked classes
- `GET /api/plans` - Get subscription plans
- `GET /api/classes` - Get all class types
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `GET /api/scheduled-classes?limit=N` - Get scheduled classes (sorted by start time)
- `GET /api/scheduled-classes/:id` - Get scheduled class by ID
- `PUT /api/scheduled-classes/:id/:action` - Book/cancel class (action: "book" or "cancel")
- `POST /api/contact` - Send contact form email

### Frontend Structure

React 19 application using Vite, React Router v7, and TanStack Query for data fetching.

**Directory Structure:**

- `src/pages/` - Route components (HomePage, ClassesPage, SubscriptionPage, SchedulePage, AboutPage)
- `src/components/` - Reusable components (Navbar, ClassCard, UserCard, BookClasses, etc.)
- `src/constants/` - Shared constants (e.g., classStyles.js for class type colors)

**Key Frontend Patterns:**

- React Router with `<Layout>` wrapper for consistent navigation
- TanStack Query for all API calls with query keys like `["scheduled-classes", { limit: 4 }]`
- Axios for HTTP requests (proxied through Vite dev server)
- Hardcoded user ID `0` for now (no authentication system yet)
- Tailwind CSS v4 for styling (using Vite plugin)
- FullCalendar library for schedule visualization

**State Management:**

- No global state management (Redux/Zustand) - using TanStack Query cache
- User booked classes tracked via `["booked-classes-id", userId]` query

### Authentication & User System

**Current State:** The application hardcodes user ID `0` throughout the frontend. There is NO authentication or login system. The subscription expiry logic exists in the database but is not enforced on the frontend for class bookings.

**Important Notes:**

- User data is fetched from `/api/users/0`
- When working on features that involve users, be aware of this limitation
- Subscription status (`active`/`inactive`) is stored in user documents with `subscription_expiry` dates

## Common Development Commands

### Root Level

```bash
# Testing (runs tests from both frontend and backend)
npm test                 # Run Vitest unit tests
npm run test:ui          # Run tests with UI
npm run test:coverage    # Generate coverage report

# Code Quality
npm run format           # Format all files with Prettier
npm run format:check     # Check formatting without modifying
npm run lint:frontend    # Run ESLint on frontend code
```

**Running a Single Test:**

```bash
npm test -- formatClassTime.test.js
```

### Frontend

```bash
cd frontend

# Development
npm run dev              # Start Vite dev server (localhost:5173)

# Building
npm run build            # Production build
npm run preview          # Preview production build

# Linting
npm run lint             # Run ESLint
```

### Backend

```bash
cd backend

# Development
npm run dev              # Start nodemon server (localhost:8000)

# Database
docker compose up -d     # Start MongoDB
docker compose down      # Stop MongoDB
docker compose down --volumes  # Stop and reset database
```

### Code Formatting

This project uses Prettier for code formatting and ESLint for linting (frontend only).

**Automatic Formatting:**

- Pre-commit hooks automatically format staged files before each commit
- VS Code formats on save (if configured with recommended extensions)

**Manual Commands (from root directory):**

```bash
# Format all files
npm run format

# Check formatting without modifying files (used in CI)
npm run format:check

# Lint frontend code
npm run lint:frontend
```

**Setup for New Developers:**

1. Install dependencies: `npm install` (in root directory)
2. Husky will auto-install Git hooks
3. Install recommended VS Code extensions (Prettier, ESLint)
4. VS Code will auto-format on save

**Disabling Pre-commit Hooks:**
If you need to commit without formatting (not recommended):

```bash
git commit --no-verify -m "Your message"
```

**Configuration:**

- [.prettierrc](.prettierrc) - Prettier formatting rules (no semicolons, double quotes, 2-space indent)
- [frontend/eslint.config.js](frontend/eslint.config.js) - ESLint rules for frontend
- [.lintstagedrc.json](.lintstagedrc.json) - Files to format on pre-commit
- [.vscode/settings.json](.vscode/settings.json) - VS Code auto-format settings

### End-to-End Testing

Cypress is configured for E2E tests but currently only has a contact form test.

```bash
cd frontend
npx cypress open         # Interactive mode
npx cypress run --spec "cypress/e2e/contact.spec.cy.js"  # Headless
```

**CI:** GitHub Actions runs Cypress tests on push/PR to main ([.github/workflows/cypress.yml](.github/workflows/cypress.yml))

## Testing Strategy

- **Unit tests:** Vitest (configured at root level) + React Testing Library for frontend tests
  - Currently minimal coverage - see [frontend/src/components/BookClasses/formatClassTime.test.js](frontend/src/components/BookClasses/formatClassTime.test.js)
  - Vitest is configured to test both `frontend/**/*.test.js` and `backend/**/*.test.js` files
  - Test configuration: [vitest.config.js](vitest.config.js)
- **E2E tests:** Cypress (only contact form currently)
- **No backend tests** currently exist, but Vitest is now configured to support them

## Environment Variables

Required in [.env](.env) at project root:

```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-specific-password
EMAIL_TO=recipient@example.com

MONGO_ENV=dev
LOCAL_MONGO_URI=mongodb://localhost:27017
PROD_MONGO_URI=mongodb+srv://...
```

## Known Technical Debt & Constraints

1. **No authentication system** - User ID is hardcoded to `0`
2. **Monolithic backend** - All routes in single file
3. **No backend tests** - Only frontend unit tests and minimal E2E coverage
4. **Subscription enforcement** - Expiry logic exists but doesn't block UI interactions
5. **No TypeScript** - Pure JavaScript codebase
6. **Direct MongoDB driver** - No schema validation or ORM benefits

## Recent Work

Recent PRs/commits have focused on subscription logic:

- Correctly handling subscription expiry when extending inactive subscriptions
- Blocking UI components when subscription is inactive
- Fixing subscription renewal to update status to "active"

See [Issues](https://github.com/thomashoddinott/fullstack-mern-demo/issues) for current work items.
