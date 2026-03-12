# Paso — Timeline Planner

A full-featured clone of [paso.to](https://paso.to) built with React + Node.js.

## Features

- **Inbox** — Capture tasks and ideas with no pressure
- **Timeline** — Visual day-by-day planner with drag-and-drop scheduling
- **Spaces** — Organize tasks and notes into separate projects
- **Notes** — Rich text notes per space
- **Auto-roll** — Unfinished past tasks roll forward to today
- **Real-time collaboration** — All changes sync live via WebSockets

## Tech Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS      |
| Drag/Drop | @dnd-kit                          |
| State     | Zustand                           |
| Backend   | Node.js, Express                  |
| Database  | SQLite (better-sqlite3)           |
| Realtime  | Socket.io                         |

## Getting Started

```bash
# Install dependencies
npm run install:all

# Start both servers (backend :3001, frontend :5173)
npm run dev
```

Then open http://localhost:5173.

## Project Structure

```
paso/
├── backend/
│   └── src/
│       ├── routes/       # tasks, notes, spaces
│       ├── database.js   # SQLite setup
│       └── server.js     # Express + Socket.io
└── frontend/
    └── src/
        ├── components/   # Sidebar, Timeline, Inbox, Notes, TaskCard
        ├── store/        # Zustand store
        └── App.jsx
```