# AI Travel Planner

Live # https://ai-travel-planner-lemon-seven.vercel.app

AI Travel Planner is a full-stack, multi-user web application that generates editable travel itineraries using Google Gemini, stores user-specific trips in MongoDB Atlas, and provides a weather-aware packing checklist as a custom AI feature. The application is built with a Next.js frontend, an Express.js backend, MongoDB Atlas for persistence, JWT-based authentication, and Gemini's `generateContent` API for itinerary generation and structured JSON-style responses. [1][2][3]

## Project overview

The project solves a practical travel-planning problem: users often want a quick trip plan, but also need the ability to personalize it after the first AI-generated draft. This application allows each authenticated user to create, save, edit, and regenerate trip plans while keeping all trip data isolated per user account. [4][3]

The core user journey is simple: register, log in, enter travel preferences, generate a trip, edit activities day by day, and use the packing assistant to prepare for the destination and climate. This makes the app more useful than a one-time text generator because it supports iterative planning rather than a single AI response. [2][4]

## Chosen tech stack

| Layer | Technology | Why it was chosen |
|------|------------|-------------------|
| Frontend | Next.js App Router, React, TypeScript | Good fit for modern React apps, routing, deployment on Vercel, and client/server rendering support. [5][1] |
| Styling | Tailwind CSS + global CSS | Fast UI development and consistent styling in the App Router structure. [6][7] |
| Backend | Node.js + Express.js | Simple REST API structure, easy integration with auth, MongoDB, and Gemini API. [8][9] |
| Database | MongoDB Atlas + Mongoose | Flexible schema for nested itinerary data, cloud-hosted deployment, and easy user-trip modeling. [3][10] |
| Authentication | JWT + bcryptjs | Lightweight token-based auth suitable for a decoupled frontend and backend architecture. [4] |
| AI layer | Google Gemini API | Fast LLM generation with support for JSON-style structured output. [2][11] |
| Deployment | Render (backend) + Vercel (frontend) | Natural hosting pair for Express and Next.js apps, with environment-variable based configuration. [9][1][12] |

This stack was chosen because it balances speed of development, low deployment friction, and a good fit for nested AI-generated travel data. A relational database could also work, but MongoDB is a strong fit here because itinerary days, activities, hotels, and packing items are naturally hierarchical. [3][10]

## Setup instructions

### Local setup

#### Prerequisites

- Node.js 18.x or 20.x LTS installed locally. [13]
- npm or yarn. [5]
- MongoDB Atlas project and connection string. [10]
- Google AI Studio API key for Gemini. [2]

#### Clone the project

```bash
git clone <your-repo-url>
cd ai-travel-planner
```

#### Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secure_secret
GEMINI_API_KEY=your_google_ai_studio_key
CLIENT_URL=http://localhost:3000
```

The backend must be restarted after editing environment variables because Node services do not automatically pick up changed runtime configuration without restart. [14][15]

#### Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

In Next.js, browser-accessible environment variables must use the `NEXT_PUBLIC_` prefix. [16][12]

### Deployed setup

#### Backend on Render

1. Create a **Web Service** on Render from the GitHub repository. [9]
2. Set **Root Directory** to `backend`. [9]
3. Set **Build Command** to:

```bash
npm install
```

4. Set **Start Command** to:

```bash
npm start
```

Using `npm run` instead of `npm start` will not launch the server; it only lists scripts. [17][9]

5. Add these environment variables in Render:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secure_secret
GEMINI_API_KEY=your_google_ai_studio_key
CLIENT_URL=https://your-frontend.vercel.app
```

6. Optionally pin the Node version in `backend/package.json`:

```json
"engines": {
  "node": ">=20 <21"
}
```

Render recommends specifying a Node version instead of relying on the default runtime. [13]

#### Frontend on Vercel

1. Import the GitHub repository into Vercel. [1]
2. Set **Framework Preset** to **Next.js**. [1]
3. Set **Root Directory** to `frontend`. This is important because the repo uses separate `frontend/` and `backend/` folders. [18][19]
4. Add this environment variable:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
```

5. Redeploy after adding environment variables, because Vercel applies environment variable changes to new builds. [12][16]

### MongoDB Atlas setup

1. Create a new Atlas project and cluster. [20][21]
2. Add a **database user** under **Security → Database Access**. [22][10]
3. Add a **network access** rule under **Security → Network Access**. For demo deployment, `0.0.0.0/0` is the fastest option; for stricter security, allow only specific outbound IP ranges. [23][24]
4. Open **Connect → Drivers** on the cluster and copy the `mongodb+srv://` connection string. [10]

## High-level architecture explanation

The application follows a split frontend-backend architecture. The Next.js frontend handles the user interface, local auth token storage, trip forms, dashboards, and packing list interactions, while the Express backend handles authentication, authorization, database writes, and AI orchestration. [1][9][4]

At a high level, the request flow is:

1. A user interacts with the Next.js frontend.
2. The frontend sends REST API requests to the Express backend.
3. Auth middleware verifies JWTs for protected routes.
4. The backend queries MongoDB using the authenticated user ID.
5. For trip generation or day regeneration, the backend calls Gemini.
6. The generated result is validated and saved into MongoDB.
7. The backend returns the saved trip to the frontend. [4][2][3]

This architecture keeps API keys and sensitive business logic on the backend, while the frontend remains focused on presentation and interaction. [4][12]

## Authentication and authorization approach

Authentication is handled with email/password login and JWT-based sessions. User passwords are hashed with `bcryptjs` before storage, and on successful login the backend issues a signed JWT. [4]

Authorization is enforced at the API layer. Every private trip route is protected by middleware that verifies the JWT and attaches the decoded user identity to `req.user`. Queries then include `userId: req.user.id` so each user can only read or mutate their own trips. This user-scoped query pattern is the core protection for multi-user data isolation. [4][3]

For deployment, CORS must also be configured carefully so the backend only accepts requests from approved frontend origins. Production origin matching should be exact and should not include a trailing slash in the configured origin value. [25][26]

## AI agent design and purpose

The AI layer is designed as a backend-only orchestration component rather than a client-side chatbot. Its job is to transform structured travel preferences into a consistent itinerary object that the application can store, render, and update. [2][11]

The main AI tasks are:

- generate a new trip itinerary,
- estimate a budget,
- suggest hotels,
- create a packing list,
- regenerate a specific travel day using user feedback. [2]

The backend builds prompts using the trip context and sends them to Gemini's `generateContent` API with JSON-oriented output. This design is important because the UI needs structured data, not free-form paragraphs. Gemini's structured output support makes it more suitable for application workflows than plain conversational text alone. [2][11]

## Creative/custom feature

The custom feature is the **AI Weather-Aware Packing Assistant**. Instead of producing a generic packing checklist, it uses the trip destination, travel month or season, and planned itinerary activities to generate a more practical list of items. [2]

The packing list is categorized into items such as documents, clothing, gear, and other essentials, and users can interact with it directly through the UI by toggling packed status. This turns the app from a pure itinerary generator into a more complete travel-preparation assistant. [2][3]

This feature was chosen because packing is a real travel pain point and fits naturally with the itinerary-generation flow. It also demonstrates how AI can support a downstream planning workflow instead of just generating a single answer. [2]

## Key design decisions and trade-offs

### 1. MongoDB over relational storage

MongoDB was chosen because itinerary data is naturally nested: a trip contains days, each day contains activities, and the trip also includes budgets, hotels, and packing items. This makes a document model convenient and reduces the need for many relational joins. The trade-off is that relational systems could offer stronger normalization and easier cross-entity analytics for larger-scale systems. [3][10]

### 2. JWT auth over session-based auth

JWT-based auth is easy to integrate with a decoupled frontend and backend, especially when the frontend and backend are deployed on different platforms. The trade-off is that token handling and client-side storage require careful security decisions. [4]

### 3. Backend-driven AI integration

Keeping Gemini calls on the backend protects the API key and allows prompt shaping, retry logic, and validation before saving data. The trade-off is slightly more backend complexity compared with calling an AI service directly from the frontend. [2][27]

### 4. Render + Vercel deployment split

Render is a simple fit for an Express API, while Vercel is optimized for Next.js. The trade-off is that cross-origin networking introduces CORS configuration work that would be simpler in a single-platform deployment. [9][1][25]

### 5. Flexible prompts over strict schema enforcement

The current implementation focuses on prompt-constrained JSON output and runtime parsing. A stricter schema-based validation layer would improve reliability further, but adds implementation overhead. Gemini supports structured output, so this is a clear future improvement path. [2]

## Known limitations

- The AI output may still require manual cleanup if the model returns incomplete or slightly inconsistent structured data. [2][27]
- The current version uses a broad Atlas network access rule (`0.0.0.0/0`) for easier cloud deployment, which is acceptable for demo use but not ideal for long-term production security. [23][24]
- The frontend currently relies on local token storage, which is simple but not the most hardened approach for high-security applications. [4]
- The project does not yet include advanced input validation, rate limiting, analytics, or role-based permissions. [14][27]
- The packing assistant is based on destination, season, and itinerary context rather than live weather APIs, so it is weather-aware in a planning sense, not a real-time forecast engine. [2]

## Folder structure

```txt
ai-travel-planner/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── types/
    │   └── utils/
    ├── package.json
    └── tailwind/postcss config files
```

## Core API routes

| Method | Route | Purpose |
|-------|-------|---------|
| POST | `/api/auth/register` | Create user account |
| POST | `/api/auth/login` | Authenticate user and return JWT |
| GET | `/api/trips` | Fetch current user's trips |
| POST | `/api/trips/generate` | Generate a new trip with Gemini |
| GET | `/api/trips/:id` | Fetch one trip |
| PUT | `/api/trips/:id` | Update trip document |
| DELETE | `/api/trips/:id` | Delete trip |
| POST | `/api/trips/:id/add-activity` | Add activity to a selected day |
| POST | `/api/trips/:id/regenerate-day` | Regenerate one day using AI |
| POST | `/api/trips/:id/packing` | Generate or refresh packing list |

## Final notes

This project is designed as a production-oriented MVP rather than a toy prototype. It demonstrates multi-user auth, user-isolated trip storage, AI-powered structured itinerary generation, deployment to separate frontend/backend platforms, and a creative packing assistant feature that extends the app beyond basic itinerary generation. [4][2][1]
