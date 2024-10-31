# Kanban Task Management App

A full-stack Kanban board application for managing tasks and projects, inspired by the Frontend Mentor design challenge.

## Project Structure

```
.
├── frontend/    # React + Vite application
├── backend/     # Express + Prisma API
└── README.md    # This file
```

## Tech Stack

### Frontend

- React (Vite)
- Styled based on Frontend Mentor design

### Backend

- Express.js server
- SQLite database
- Prisma ORM for database management
- RESTful API design

## Getting Started

1. Clone the repository

```bash
git clone [your-repo-url]
cd kanban-app
```

2. Install dependencies for both frontend and backend

```bash
# Frontend dependencies
cd frontend
npm install

# Backend dependencies
cd ../backend
npm install
```

3. Set up the database

```bash
cd backend
npx prisma migrate dev
```

4. Start the development servers

In separate terminal windows:

```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

The frontend will be available at `http://localhost:5173` and the API at `http://localhost:3000`

## Development

- Frontend code is in the `frontend/` directory
- Backend code is in the `backend/` directory
- Database schema is defined in `backend/prisma/schema.prisma`

## Attribution

Design inspiration from [Frontend Mentor](https://www.frontendmentor.io/)