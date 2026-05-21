# Construction Platform - Developer Guide & Workflow

Welcome to the Construction Platform project! This document serves as a guide for new developers to understand the project architecture, its core workflows, and the steps required to set up, run, and test the application locally.

## 🏗 Project Overview
This platform is a marketplace connecting **Customers** (Homeowners/Builders) with **Contractors** for construction, renovation, and commercial projects.
- **Customers** can post project requirements (including location, land size, and budget).
- **Contractors** can browse open projects and submit bids (estimated price, timeline, proposal).
- **Real-time Chat** enables communication between customers and contractors to finalize details.

## 🛠 Tech Stack
**Frontend (`/frontend`)**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS & Shadcn UI (for styling and components)
- Zustand (State management)
- Socket.io-client (Real-time updates)

**Backend (`/backend`)**
- Node.js & Express.js
- MongoDB & Mongoose (Database & ORM)
- Socket.io (WebSockets for real-time chat)
- JSON Web Tokens (JWT) & bcryptjs (Authentication)

---

## 📂 Repository Structure
```
d:\Project\Construction
│
├── backend/               # Node/Express API Server
│   ├── src/
│   │   ├── config/        # DB & Socket configurations
│   │   ├── controllers/   # Route handlers (Business logic)
│   │   ├── middlewares/   # Auth, Error handling
│   │   ├── models/        # Mongoose schemas (User, Project, Bid, Chat, etc.)
│   │   ├── routes/        # Express routers
│   │   ├── utils/         # Helper functions
│   │   ├── app.js         # Express app setup
│   │   └── server.js      # Server entry point
│   └── package.json       # Backend dependencies
│
└── frontend/              # Next.js Web Application
    ├── src/
    │   ├── app/           # Next.js App Router pages (e.g., dashboard)
    │   ├── components/    # Reusable React components
    │   ├── lib/           # Utility functions and axios setup
    │   └── store/         # Zustand global state stores
    └── package.json       # Frontend dependencies
```

---

## 🔄 Core Workflow

1. **Authentication:**
   - Users register/login via phone number/email.
   - Roles include: `customer`, `contractor`, and `admin`.

2. **Project Posting (Customer Workflow):**
   - Customer creates a new **Project** by providing the title, description, project type (residential/commercial), location (with coordinates), land size, and budget.
   - The project status defaults to `open`.

3. **Bidding Process (Contractor Workflow):**
   - Contractors browse `open` projects.
   - A Contractor submits a **Bid** containing `estimatedPrice`, `timelineDays`, and `proposalText`.
   - The customer reviews bids on their project.
   - If the customer accepts a bid, the bid status becomes `accepted`, the project status updates to `assigned`, and the `winningBidId` is set on the project.

4. **Communication:**
   - Customers and Contractors use real-time Chat (powered by Socket.io) to communicate securely within the platform.

---

## 🚀 Steps to Setup and Run Locally

To check or develop the project locally, follow these steps:

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Running locally or a MongoDB Atlas URI)

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd d:/Project/Construction/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder and add the following variables:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/construction_db  # Or your Atlas connection string
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=90d
   ```
4. Start the backend server (using nodemon for hot-reloading):
   ```bash
   npm run dev
   ```
   *The server will start at `http://localhost:5000`.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd d:/Project/Construction/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. *(Optional)* Create a `.env.local` file in the `frontend` folder for environment variables like API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
   ```
4. Start the frontend Next.js development server:
   ```bash
   npm run dev
   ```
   *The client will start at `http://localhost:3000`.*

### 4. How to Test the Application
1. **Open the browser** and navigate to `http://localhost:3000`.
2. **Register a test user** as a `customer`.
3. **Create a project** through the dashboard.
4. **Register a second user** (using an incognito window or different browser) as a `contractor`.
5. **Find the project** and submit a bid.
6. **Switch back** to the customer account to accept the bid and test real-time chat.
