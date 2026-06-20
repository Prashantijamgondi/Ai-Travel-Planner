# AI Travel Planner 

LIVE- https://ai-travel-planner-lemon-seven.vercel.app/

A full-stack, multi-user AI Travel Planner built with **Next.js**, **Express.js**, **MongoDB Atlas**, and **Google Gemini API**. The app lets users register, log in, generate travel itineraries, edit day-by-day activities, estimate budgets, and maintain a weather-aware packing checklist. The frontend uses the Next.js App Router, and the backend provides authenticated REST APIs protected with JWT. [cite:32][cite:35][cite:4]

## Features

- User registration and login with JWT-based authentication and bcrypt password hashing. [cite:6]
- Multi-user trip isolation, where each trip belongs only to its authenticated owner. [cite:6][cite:11]
- AI-powered itinerary generation using the Gemini `generateContent` API with JSON output. [cite:4][cite:10]
- Budget estimation, hotel recommendations, and weather-aware packing list generation. [cite:4]
- Dynamic trip editing, including add activity, remove activity, and regenerate a specific day. [cite:4]
- Responsive dashboard UI built with Next.js and Tailwind CSS global styling. [cite:35][cite:36]

## Tech stack

| Layer | Technology |
|------|------------|
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS [cite:32][cite:35] |
| Backend | Node.js, Express.js [cite:43] |
| Database | MongoDB Atlas, Mongoose [cite:11] |
| Authentication | JWT, bcryptjs [cite:6] |
| AI | Google Gemini API `generateContent` [cite:4][cite:10] |
| Deployment | Vercel for frontend, Render or Railway for backend [cite:6] |

## Project structure

```txt
ai-travel-planner/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Trip.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── tripController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── tripRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── globals.css
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   └── dashboard/page.tsx
    │   ├── components/
    │   │   ├── CreateTripForm.tsx
    │   │   ├── ItineraryCard.tsx
    │   │   └── PackingList.tsx
    │   ├── utils/
    │   │   └── api.ts
    │   └── types/
    │       └── index.ts
    ├── tailwind.config.ts
    ├── postcss.config.js
    └── package.json
```

## Prerequisites

Before running the project, install the following:

- Node.js 18.x or 20.x LTS. [cite:32]
- npm or yarn. [cite:32]
- A MongoDB Atlas connection string. [cite:11]
- A Google AI Studio API key for Gemini. [cite:4]

## Environment variables

Create a `backend/.env` file using this template:

```env
PORT=5000
MONGO_URI=mongodb+srv://your_mongodb_uri
JWT_SECRET=your_super_secure_secret
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:3000
```

The backend must be restarted after editing `.env`, because Node.js processes do not automatically reload environment values unless restarted. [cite:52]

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ai-travel-planner
```

### 2. Setup backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend starts an Express server, connects to MongoDB, and exposes authentication and trip APIs. Express route debugging is easiest when server logs are visible in the terminal during development. [cite:52][cite:43]

### 3. Setup frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000`, and the backend usually runs on `http://localhost:5000`. In a Next.js App Router project, the homepage is controlled by `src/app/page.tsx`, while global styles are imported from `src/app/globals.css` through `src/app/layout.tsx`. [cite:32][cite:35][cite:36]

## Core API routes

| Method | Route | Description |
|-------|-------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/trips` | Get all trips for the logged-in user |
| POST | `/api/trips/generate` | Generate a new AI trip |
| GET | `/api/trips/:id` | Get one trip by ID |
| PUT | `/api/trips/:id` | Update a trip |
| DELETE | `/api/trips/:id` | Delete a trip |
| POST | `/api/trips/:id/add-activity` | Add an activity to a specific day |
| DELETE | `/api/trips/:id/days/:dayNumber/activities/:activityId` | Remove one activity |
| POST | `/api/trips/:id/regenerate-day` | Regenerate a single day with AI |
| POST | `/api/trips/:id/packing` | Regenerate the packing list |

## Authentication flow

1. A user registers or logs in from the frontend.
2. The backend hashes passwords with `bcryptjs` and returns a signed JWT on successful authentication. [cite:6]
3. The frontend stores the token and sends it in the `Authorization: Bearer <token>` header for protected requests. [cite:6]
4. The backend middleware verifies the token and attaches the decoded user to `req.user`. [cite:6]
5. Each trip query includes `userId: req.user.id` so users can access only their own data. [cite:6][cite:11]

## AI generation flow

1. The frontend submits destination, duration, budget tier, interests, and optional travel month.
2. The backend builds a structured prompt and calls the Gemini `generateContent` endpoint. [cite:4][cite:10]
3. Gemini returns structured JSON for itinerary, hotels, budget, and packing items when configured for JSON output. [cite:4]
4. The backend parses the JSON and stores it in MongoDB using the authenticated user's `userId`. [cite:4][cite:11]
5. Users can later update a single day instead of regenerating the whole trip, which keeps customization faster and more practical. [cite:4]

## Deployment

### Frontend

Deploy the frontend to Vercel and set:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
```

Next.js is designed to deploy well on Vercel, especially when using the App Router. [cite:32]

### Backend

Deploy the backend to Render or Railway and add the environment variables from `.env`. Keep `.env` out of version control and never commit secrets. [cite:52]

## Future improvements

- Add Zod validation for request bodies.
- Add inline error messages and loading skeletons.
- Add a delete activity UI.
- Add trip sharing or export to PDF.
- Add trip images and map previews.
- Use structured Gemini schemas for stricter JSON validation. Google documents structured output support for Gemini, which improves response consistency for JSON-based applications. [cite:4]

## License

This project can be used for academic, portfolio, and learning purposes. Add your own license if you plan to publish it publicly.
