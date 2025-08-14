# Project Overview

This project is a web application built with the following technologies:

## Tech Stack

### Backend

- **Deno**: A modern runtime for JavaScript and TypeScript, built on V8.
- **TypeScript**: A strongly typed programming language that builds on JavaScript.
- **Oak**: A middleware framework for Deno's HTTP server, used for building APIs.

### Frontend

- **Vue 3**: A progressive JavaScript framework for building user interfaces.
- **Vite**: A fast build tool and development server for modern web projects.
- **Pinia**: A state management library for Vue 3.
- **TypeScript**: Ensures type safety and better developer experience.

### Database

- **PostgreSQL (PSQL)**: A powerful, open-source object-relational database system.

## Project Structure

- `frontend/`: Contains the Vue 3 frontend application.
- `backend/`: Contains the Deno backend application.

## How to Run

### Backend

1. Install Deno from [deno.land](https://deno.land/).
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Run the server:
   ```bash
   deno run --allow-net main.ts
   ```

### Frontend

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## How to Test

Run the backend tests:

```bash
cd backend
 deno test --allow-net
```
