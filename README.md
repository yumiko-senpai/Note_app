# Notes App

A simple MERN stack notes application with JWT authentication. The backend and frontend run in a single Node.js container and connect to a MongoDB instance provisioned via Docker Compose. Automated tests for the authentication and notes APIs are executed with Jest in GitHub Actions.

## Features

- User registration and login with hashed passwords and JSON Web Tokens
- Authenticated CRUD endpoints for personal notes
- React single-page application for managing notes
- Docker Compose setup for Node.js + MongoDB
- GitHub Actions workflow running Jest API tests

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

## Getting Started

1. Copy the example environment variables and update them as needed:

   ```bash
   cp .env.example .env
   ```

2. Start the application stack:

   ```bash
   docker-compose up --build
   ```

   The app will be available at http://localhost:5000. The React frontend is served from the same Node.js server as the API.

3. Stop the stack:

   ```bash
   docker-compose down
   ```

## Running Tests Locally

The Jest suite uses an in-memory MongoDB instance, so no additional services are required:

```bash
npm install
npm test
```

## Project Structure

```
.
├── client/            # React frontend (built with Vite)
├── server/            # Express backend, models, and routes
├── tests/             # Jest + Supertest API tests
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile         # Node.js container configuration
└── README.md
```

## API Overview

- `POST /api/auth/register` – Register a new user
- `POST /api/auth/login` – Login and receive a JWT
- `GET /api/notes` – Get all notes for the authenticated user
- `POST /api/notes` – Create a new note
- `PUT /api/notes/:id` – Update an existing note
- `DELETE /api/notes/:id` – Delete a note

Include the `Authorization: Bearer <token>` header for all `/api/notes` requests.
