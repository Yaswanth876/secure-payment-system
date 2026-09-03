# Payment Guardian

Payment Guardian is a human-centered technical foundation for a safer and more inclusive digital payments experience. This repository currently contains only the project setup and a development health check.

## Current Module

Module 0 - Project Foundation

## Technology

- React
- Vite
- Tailwind CSS
- Node.js
- Express
- REST API

## Project Structure

- `frontend/` contains the Vite React client and its API service.
- `backend/` contains the Express server and API routes.
- The root package provides a command to run both applications together.

## Running the Project

Install the root development dependency and both application dependencies:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

Start the frontend and backend together:

```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend runs at `http://localhost:5000`.

## Health Check

The backend exposes:

```text
GET /api/health
```

It returns the service status as JSON.