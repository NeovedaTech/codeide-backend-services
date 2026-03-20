# Project Setup

This document describes how to set up and run the assessment platform backend for local development.

## Prerequisites

- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/en/) (v18 or later) - for running without Docker
- [Yarn](https://yarnpkg.com/getting-started/install) - for running without Docker

## Getting Started with Docker (Recommended)

This is the recommended way to run the project for local development, as it sets up all the required services (backend, worker, database, and Redis) in a self-contained environment.

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd assesment-platform-backend
    ```

2.  **Create an environment file:**

    Copy the example environment file to a new `.env` file.

    ```bash
    cp .env.example .env
    ```

    The default values in `.env.example` are pre-configured to work with the Docker Compose setup. You shouldn't need to change them for local development.

3.  **Build and run the services:**

    ```bash
    docker-compose up --build
    ```

    This will start the following services:
    -   `backend`: The main Node.js API server on port 3000.
    -   `worker`: The background worker that processes jobs from the queue.
    -   `mongo`: The MongoDB database on port 27017.
    -   `redis`: The Redis server on port 6379.

    To stop the services, press `Ctrl+C`. To stop and remove the containers, run:
    ```bash
    docker-compose down
    ```

## Local Development without Docker

If you prefer to run the services directly on your machine, follow these steps. You will need to have your own MongoDB and Redis instances running.

1.  **Install dependencies:**

    ```bash
    yarn install --frozen-lockfile
    ```

2.  **Configure environment variables:**

    Create a `.env` file and update the `MONGODB_URI` and Redis variables to point to your local instances.

3.  **Run the backend server:**

    ```bash
    yarn dev
    ```

4.  **Run the worker:**

    In a separate terminal, run:

    ```bash
    yarn worker
    ```
