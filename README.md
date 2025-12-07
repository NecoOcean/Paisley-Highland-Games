# Paisley Highland Games

A full-stack web application for managing Scottish Highland Games events, featuring event management, competitor registration, and results tracking.

## Tech Stack

**Frontend:** React 19, React Router 7, Axios, Vite 7
**Backend:** Express.js 5, better-sqlite3, JWT authentication, bcryptjs
**Database:** SQLite

## Quick Start

### Prerequisites

- Node.js 18+
- npm

### Backend Setup (Port 3001)

```bash
cd backend
npm install
npm run seed    # Initialize database with sample data
npm run dev     # Start development server
```

### Frontend Setup (Port 5173)

```bash
cd frontend
npm install
npm run dev     # Start Vite dev server
```

### Docker

```bash
docker-compose up       # Run both services
docker-compose up -d    # Run in background
```

## Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| `PORT` | Backend | Server port (default: 3001) |
| `JWT_SECRET` | Backend | Secret key for JWT signing |
| `NODE_ENV` | Backend | Environment mode |
| `VITE_API_URL` | Frontend | Backend API base URL |

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@paisleyhighlandgames.com | admin123 |
| Competitor | john@example.com | user123 |

## API Endpoints

| Route | Description |
|-------|-------------|
| `/api/auth` | Authentication (login, register, profile) |
| `/api/events` | CRUD for Highland Games events |
| `/api/competitors` | Competitor profiles |
| `/api/registrations` | Event registrations |
| `/api/announcements` | News and announcements |
| `/api/contact` | Contact form messages |
| `/api/results` | Competition results |

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.js          # Entry point
│   │   ├── db/               # Database schema and seeding
│   │   ├── routes/           # API route handlers
│   │   └── middleware/       # Auth middleware (JWT)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Root component, routing
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # Auth context
│   │   └── services/         # API client
│   └── package.json
└── docker-compose.yml
```

## Available Scripts

### Backend

- `npm start` - Production server
- `npm run dev` - Development server with hot reload
- `npm run seed` - Seed database with sample data

### Frontend

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

ISC
