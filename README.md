# Intervue_Assignment

A full-stack, real-time live polling application designed with state resilience to survive page refreshes, late-joining students, and network disconnections. 

## Project Architecture

This application consists of two main personas: Teacher (Admin) and Student (User). It utilizes a modern tech stack to ensure instant vote mapping and persistence.

### Tech Stack
* **Frontend:** React.js, TypeScript, Vite, Tailwind CSS v4, Context API
* **Backend:** Node.js, Express.js, TypeScript
* **Real-time Engine:** Socket.io
* **Database:** MongoDB (Mongoose)

## Core Features

### Teacher Persona
* **Poll Creation:** Create custom questions with dynamic, variable-length option fields.
* **Live Dashboard:** Monitor real-time vote distribution via interactive progress bars.
* **Participant Management:** View active socket connections and kick disruptive students.
* **Poll History:** View all past polls fetched directly from the database.

### Student Persona
* **Session Persistence:** Join with a unique name that is securely stored in Session Storage to prevent duplicate voting.
* **Server-Synced Timer:** The countdown timer calculates its remaining duration dynamically based on the server start time `(serverStartTime + duration - Date.now())`. This ensures late-joiners cannot bypass the time limit.
* **Real-time UI:** Answers submit instantly over WebSockets. Once voted or when time expires, the student sees the live results updating in real-time as peers continue to answer.
* **Kicked Out State:** If removed by the teacher, the socket connection drops and the student cannot rejoin the active session.

## State Resilience & Error Handling

* **Accidental Refreshes:** If a teacher or student refreshes the browser mid-poll, their session is automatically restored via React Context initialization bounds. The active Socket event is fetched, instantly regenerating the exact state of the live poll.
* **Database Outages:** The backend Express controllers and Socket listeners are hardened with try-catch enclosures and fast-fail Mongoose timeouts to gracefully alert the user via UI Toast notifications rather than crashing the node process.

## Local Setup Instructions

### Prerequisites
* Node.js (v18 or higher recommended)
* MongoDB (Local instance running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI)

### Backend Initialization
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend will run on port 5010 by default.*

### Frontend Initialization
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development environment:
   ```bash
   npm run dev
   ```
   *The frontend will typically run on localhost:5173.*

## Deployment

* **Frontend:** Designed for zero-config deployment on Vercel. 
* **Backend:** Mounts cleanly to Render or Railway. Set your `MONGODB_URI` environment variable before deploying.
