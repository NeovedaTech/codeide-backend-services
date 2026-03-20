# Architecture Overview

This document provides a high-level overview of the architecture of the assessment platform backend.

## System Components

The application is built using a microservices-oriented architecture, with several key components working together.

![System Architecture Diagram](https://i.imgur.com/3yQkG5B.png)

1.  **Backend (Node.js / Express)**
    -   This is the main API server that handles all incoming HTTP requests from the client-side application.
    -   **Responsibilities:**
        -   Provides RESTful API endpoints for assessments, users, solutions, etc.
        -   Handles user authentication and authorization using JSON Web Tokens (JWT).
        -   Performs data validation and business logic.
        -   Adds jobs to the queue for asynchronous processing by the worker.
    -   **Dockerfile:** `Dockerfile`

2.  **Worker (Node.js / BullMQ)**
    -   This is a background process that listens for and processes jobs from the Redis queue.
    -   **Responsibilities:**
        -   Handles long-running or computationally intensive tasks that should not block the main API server.
        -   Examples: Evaluating assessment submissions, sending emails, generating reports.
    -   **Dockerfile:** `worker.Dockerfile`

3.  **MongoDB**
    -   The primary database for the application. It stores all persistent data.
    -   **Data Models:**
        -   `User`: Stores user information.
        -   `Assesment`: Defines the structure of an assessment.
        -   `Solution`: Stores a user's submission for an assessment.
        -   `QuestionPool`: A collection of questions that can be used in assessments.

4.  **Redis**
    -   An in-memory data store used for two main purposes:
        -   **Message Broker (BullMQ):** Manages the queues that decouple the backend from the worker. The backend pushes jobs to a queue, and the worker pulls jobs from it.
        -   **Caching (Optional):** Can be used to cache frequently accessed data to reduce database load and improve response times.

## Directory Structure

Here is a breakdown of the most important directories in the project:

```
.
├── config/           # Configuration files for database, redis, etc.
├── constants/        # Global constants.
├── controllers/      # Express route handlers that contain the business logic.
├── middlewares/      # Custom Express middleware (e.g., for authentication).
├── models/           # Mongoose schemas for the MongoDB database.
├── queue/            # Queue definitions and initialization (BullMQ).
├── routes/           # Express route definitions.
├── services/         # Reusable application services (e.g., queue service).
├── workers/          # Background worker scripts.
├── Dockerfile        # Dockerfile for the backend service.
├── worker.Dockerfile # Dockerfile for the worker service.
├── docker-compose.yml# Defines and configures all the services.
└── index.js          # The main entry point for the backend application.
```
