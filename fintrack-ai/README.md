# FinTrack AI — AI-Powered Financial Management Chatbot

A full-stack web app that helps college students track income/expenses and get
AI-powered budgeting advice through a chat assistant ("FinBot") that reads the
user's real transaction data before answering.

## Tech Stack

- **Frontend:** React 18, React Router, Recharts (charts), Axios, Vite
- **Backend:** Node.js, Express, better-sqlite3
- **Auth:** JWT + bcrypt password hashing
- **AI:** Anthropic Claude API (claude-sonnet-4-6)

## Features

- Email/password signup & login (JWT-secured)
- Add, view, filter, and delete income/expense transactions
- Dashboard with income vs. expense trend chart and spending-by-category breakdown
- AI chat assistant that answers questions about the user's actual finances
  (e.g. "How much did I spend on food this month?", "Give me saving tips")
  by feeding live transaction summaries into the Claude API as context
- Persistent chat history per user

## Project Structure

```
fintrack-ai/
├── backend/
│   ├── src/
│   │   ├── db/database.js        # SQLite schema + connection
│   │   ├── middleware/auth.js    # JWT verification middleware
│   │   ├── routes/               # auth, transactions, chat, user routes
│   │   ├── services/aiService.js # Builds financial context + calls Claude API
│   │   └── server.js             # Express app entry point
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/client.js         # Axios instance with JWT interceptor
    │   ├── context/AuthContext.jsx
    │   ├── components/           # Layout, AuthLayout
    │   ├── pages/                # Login, Signup, Dashboard, Transactions, Chat
    │   └── styles/tokens.css     # Design tokens
    └── package.json
```

## Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:
- `JWT_SECRET` — any long random string
- `ANTHROPIC_API_KEY` — your Claude API key from https://console.anthropic.com/

```bash
npm run dev
```

Backend runs on `http://localhost:5000`. The SQLite database file
(`data.sqlite`) is created automatically on first run — no manual DB setup
needed.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` and proxies `/api` requests to the
backend automatically (see `vite.config.js`).

### 3. Use it

1. Open `http://localhost:5173`
2. Create an account
3. Add a few transactions on the Ledger page
4. Check the Overview dashboard
5. Ask FinBot a question about your spending

## Notes for Placement / Resume Use

- This is a genuine full-stack project (not a single demo file): separate
  REST API backend, persistent database, JWT auth, and a multi-page React
  frontend — good talking points for interviews.
- The AI integration is **context-grounded**: instead of generic chatbot
  replies, `aiService.js` queries the database for the user's real totals,
  category breakdown, and recent transactions, and passes that as context to
  Claude so answers are specific and accurate.
- Suggested resume bullet point is provided separately — ask if you'd like it
  generated as a Word doc or plain text.

## Possible Extensions (good "future work" talking points)

- Budget goal alerts (notify when a category exceeds a set limit)
- CSV export/import of transactions
- Recurring transactions (subscriptions, rent)
- Multi-currency support
- Deploy backend (Render/Railway) + frontend (Vercel/Netlify) for a live demo link
