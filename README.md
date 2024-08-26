# API Health Monitor and User Management System

This project provides functionality for verifying the health of the database connection and managing user details. It is built using Node.js and Express, with custom images created using Packer and a CI/CD workflow managed via GitHub Actions.

## Introduction

The API Health Monitor and User Management System is an Express application designed to perform health checks on database connectivity and manage user details. It includes two main routes: `HealthCheck` for database connectivity verification and `User` for user-related operations.

## Prerequisites

Before building and deploying the application locally, ensure you have the following prerequisites:

- Node.js (version 18 or later)
- npm (Node Package Manager)
- Packer (for building custom images)
- GitHub Actions (for CI/CD)

## Health Check Route

The `HealthCheck` route is responsible for handling health check requests to verify the status of the database connection. It provides endpoints for checking the database connection and handling unsupported HTTP methods.

### Endpoints

- `/healthz`: Verifies the database connection and handles specific conditions.
- `/healthz` (POST, PUT, PATCH, DELETE, HEAD, OPTIONS, TRACE): Handles method-not-allowed for specific HTTP methods.
- `/**`: Manages unknown URLs with a standard response.

## User Route

The `User` route manages user-related operations, such as adding users, retrieving user details, and updating user information. It also handles unsupported HTTP methods for both general user operations and self-related operations.

### Endpoints

- `POST /v1/user`: Adds a new user to the system.
- `GET /v1/user/self`: Retrieves details of the authenticated user.
- `PUT /v1/user/self`: Updates information for the authenticated user.
- `GET /v1/user/verify`: Verifies the user.
- `/v1/user`, `/v1/user/self` (GET, PUT, PATCH, DELETE, HEAD, OPTIONS, TRACE): Handles method-not-allowed for user-related endpoints.

## Configuration

The project uses an environment configuration file (`.env`) to manage database connectivity settings and other environment-specific configurations.

## Usage

To run the project locally, follow these steps:

1. Clone the repository: `git clone git@github.com:Amresh-Cloud/webapp.git`
2. Install dependencies: `npm install`
3. Configure the `.env` file with your database settings.
4. Start the application: `npm start`


## Continuous Integration and Deployment

The project includes a continuous integration and deployment workflow using GitHub Actions and Packer.

### CI/CD Workflow Details

1. **Checkout Source Code**: The workflow begins by checking out the source code from the repository.
2. **Set Up Node.js**: Node.js is set up in the GitHub runner environment.
3. **Install Dependencies**: Dependencies are installed using `npm install`.
4. **Build Custom Image**: Packer is used to build a custom image, ensuring a consistent environment across deployments.
5. **Run Tests**: Integration tests are executed to validate the `/v1/user` endpoint functionality.
6. **Deploy**: The built image is deployed as part of the CI/CD process.

### CI Workflow Configuration

The workflow is triggered on pull requests to the main branch and includes steps for building the custom image and running integration tests.
