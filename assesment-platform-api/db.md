# Database Documentation

This document outlines the database setup, connection, and the Mongoose models used in the application.

## Database Overview

The primary database used by this application is **MongoDB**, a NoSQL document database. MongoDB is chosen for its flexibility, scalability, and ability to handle semi-structured data, which is well-suited for the dynamic nature of assessment platforms.

## Database Connection

The application connects to MongoDB using the [Mongoose](https://mongoosejs.com/) library, an Object Data Modeling (ODM) library for MongoDB and Node.js.

The database connection logic is handled in `config/config.js` and initiated in `index.js`.
The `MONGODB_URI` environment variable, defined in your `.env` file, specifies the connection string to your MongoDB instance.

## Mongoose Models

The `models/` directory contains the Mongoose schemas and models, defining the structure and behavior of the data stored in MongoDB.

### 1. `User` Model (`models/User.js`)

-   **Purpose**: Represents a user of the platform.
-   **Schema**:
    -   `name`: User's full name.
    -   `email`: User's email address (unique).
    -   `password`: Hashed password for user authentication.
    -   `timestamps`: Automatically adds `createdAt` and `updatedAt` fields.

### 2. `Assesment` Model (`models/Assesment.js`)

-   **Purpose**: Defines the structure and properties of an assessment (e.g., a test or quiz).
-   **Schema**:
    -   `name`: Name of the assessment.
    -   `slug`: URL-friendly identifier for the assessment.
    -   `sections`: An array of `SectionSchema` embedded documents, defining different parts of the assessment.
    -   `isAvailable`: Boolean indicating if the assessment is currently available.
    -   `visibility`: Controls who can see the assessment ('private', 'public', 'group').
    -   `cost`: Cost associated with taking the assessment.
    -   `creator`: Reference to the `User` who created the assessment.
    -   `timestamps`: Automatically adds `createdAt` and `updatedAt` fields.

### 3. `Solution` Model (`models/Solution.js`)

-   **Purpose**: Stores a user's submission and responses for a specific assessment.
-   **Schema**:
    -   `userId`: Reference to the `User` who took the assessment.
    -   `assesmentId`: Reference to the `Assesment` that was taken.
    -   `currSection`: Tracks the current section the user is on during an assessment.
    -   `ufmAttempts`: Counts attempts to detect unfair means.
    -   `response`: An array of `SectionResponseSchema` embedded documents, detailing answers for each section.
    -   `isSubmitted`: Boolean indicating if the full assessment has been submitted.
    -   `isEvaluated`: Boolean indicating if the solution has been evaluated.
    -   `feedback`: Array of mixed types for storing evaluation feedback.
    -   `timestamps`: Automatically adds `createdAt` and `updatedAt` fields.

### 4. `QuestionPool` Model (`models/QuestionPool.js`)

-   **Purpose**: A collection of questions that can be used across various assessments.
-   **Schema**:
    -   `name`: Name of the question pool.
    -   `questions`: An array of `QuestionSchema` embedded documents (details assumed to be in `test/QuestionSchema.js`), containing the actual question data.
    -   `timestamps`: Automatically adds `createdAt` and `updatedAt` fields.

### 5. `Problem` Model (`models/Problem.js`)

-   **Purpose**: Represents a single coding problem that can be included in an assessment's `problemPool`.
-   **Note**: The `models/Problem.js` file does not exist yet. The schema below is a proposed structure based on common requirements for a coding assessment platform.
-   **Proposed Schema**:
    -   `title`: The title of the coding problem (e.g., "Two Sum").
    -   `description`: A detailed description of the problem, including requirements, input/output format, and examples.
    -   `difficulty`: The difficulty level of the problem (e.g., 'Easy', 'Medium', 'Hard').
    -   `constraints`: Any constraints on the input values (e.g., "The number of elements in the array will be between 2 and 1000.").
    -   `starterCode`: Boilerplate code in one or more languages provided to the user as a starting point.
    -   `testCases`: An array of test cases used to evaluate a user's solution. Each test case would include an `input` and the `expectedOutput`.
    -   `timestamps`: Automatically adds `createdAt` and `updatedAt` fields.
