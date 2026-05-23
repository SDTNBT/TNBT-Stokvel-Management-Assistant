# TNBT-Stokvel-Management-Assistant
Final-Year web application project developed for the Software Design academic course which utilizes the Scrum methodology , Test-Driven Development , and CI/CD pipelines.
## Overview
This repository contains the web application developed by a team of 6 WITS students, for the Software Design course within the School of Computer Science and Applied Mathematics.
## Development Practices
This project is built following strict industry-standard practices, specifically:
  ### Agile Scrum Methodology: We use an iterative development approach, managing a full product backlog and pulling specific tasks into sprint-based tracking.
  ### Requirements Engineering: All system features are structured as user stories using the strict Who-What-Why format.
  ### Test-Driven Development (TDD): Every completed user story is validated against User Acceptance Tests formulated in the Given-When-Then format. Code coverage is tracked on this repository using Jest.
  ### CI/CD Pipelines: Automated workflows are configured using GitHub Actions to ensure the software remains in a publicly available standalone build.
## Local Setup Instructions
To run this application locally, please follow these steps:

1. **Prerequisites**
    * Ensure you have **Node.js** installed on your machine.
    * Ensure you have a configured `.env` file in the root directory containing necessary environment variables (e.g., database connection strings, API keys for Firebase, Stripe, and Google APIs).

2. **Installation**
    * Navigate to the root directory and install the required dependencies:
        ```bash
        npm install
        ```
    * If you are running a separate frontend, navigate into the `frontend` folder and install dependencies there as well:
        ```bash
        cd frontend && npm install
        ```

3. **Running the Application**
    * To start the server in development mode (using `nodemon`), run:
        ```bash
        npm run dev
        ```
    * To start the application in production mode, run:
        ```bash
        npm start
        ```

4. **Running Tests**
    * To execute the test suite and generate a coverage report, run:
        ```bash
        npm test
        ```

## Repository Navigation
| Component | Location |
| :--- | :--- |
| **Source Code** | `/backend` and `/frontend` directories |
| **Scrum Artifacts** | `/Documentation` folder |
| **Architecture & Design** | `/Diagrams` folder |
| **Testing Reports** | Generated via `npm test` |
