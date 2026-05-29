# FullStack Mastery — Express · Axios · React Query

> A 10-day comprehensive course app covering Express.js, Axios, and React Query with a live Monaco code simulator, built as an installable PWA.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## 📦 Production Build

```bash
npm run build
npm run preview   # preview the production build locally
```

## 🌐 Deploy to GitHub Pages

### One-time setup:
1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Under **Build and deployment**, set Source to **GitHub Actions**
4. Push to `main` — the workflow runs automatically

The app will be live at: `https://<your-username>.github.io/<repo-name>/`

### Workflow file:
The workflow is at `.github/workflows/deploy.yml` and runs on every push to `main`.

## 📱 PWA Installation

After deploying to GitHub Pages:
- **Chrome/Edge desktop**: Click the install icon in the address bar
- **Android Chrome**: Tap the "Add to Home Screen" banner
- **iOS Safari**: Share → Add to Home Screen

## 🗂 Project Structure

```
src/
├── components/
│   ├── App.jsx              # Root: routing, theme, progress state
│   ├── Sidebar.jsx          # Navigation sidebar with progress
│   ├── DayView.jsx          # Renders a full day of content
│   ├── HomePage.jsx         # Landing page
│   ├── SectionRenderer.jsx  # Renders all content block types
│   └── Simulator.jsx        # Monaco editor + mock axios runtime
├── data/
│   ├── curriculum.js        # All 10 days of course content
│   └── mockApi.js           # Mock API response registry
└── main.jsx                 # Entry point + SW registration
```

## ✨ Features

- **Live Simulator**: Monaco editor with mock Axios — run Express/Axios/RQ patterns in the browser
- **10 Daily Challenges**: Starter code + hidden solutions with reveal button
- **SQL Server & PostgreSQL**: Real query patterns with parameterized queries
- **Dark/Light Theme**: Toggle anytime, persisted to localStorage
- **Progress Tracking**: Mark days complete, resume where you left off
- **Offline-first PWA**: Works offline after first load, installable

## 📖 Curriculum

| Day | Topic | Focus |
|-----|-------|-------|
| 1 | Express.js | Server basics, routes, req/res |
| 2 | Express.js | Route parameters, query strings, Router |
| 3 | Express.js | Middleware, CORS, auth, error handling |
| 4 | Express.js | SQL Server + PostgreSQL integration |
| 5 | Axios | GET/POST/PUT/DELETE, response object |
| 6 | Axios | Instances, interceptors, error handling, Promise.all |
| 7 | Axios | Vite/React integration, custom hooks |
| 8 | React Query | useQuery, QueryClient, staleTime, cache |
| 9 | React Query | useMutation, optimistic updates, pagination, infinite scroll |
| 10 | Full Stack | End-to-end integration: Express + PG + Axios + React Query |

## 🛠 Tech Stack

- **Vite** + **React 18** for the app
- **@monaco-editor/react** for the code simulator
- **vite-plugin-pwa** for PWA + service worker
- **GitHub Actions** for CI/CD to GitHub Pages
