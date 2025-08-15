# Ticketing System
A full-stack ticketing system with a Spring Boot backend and a Next.js frontend.

## Features

- User authentication (JWT)
- Admin and user roles
- Ticket creation, assignment, and management
- Commenting on tickets
- Dashboard for users and admins

<img width="1654" height="921" alt="image" src="https://github.com/user-attachments/assets/58409333-8d69-4b4e-aa15-9c646ae5d5ec" />
<img width="1761" height="838" alt="image" src="https://github.com/user-attachments/assets/3db57cc1-c489-48cd-ac27-ecbd6e562b20" />

## Tech Stack
- Backend: Java, Spring Boot, Spring Security, JWT, Maven
- Frontend: Next.js, React, Tailwind CSS

## Getting Started

### Backend

1. Navigate to the `backend` directory:
   ```
   cd backend
   ```
2. Build and run the Spring Boot application:
   ```
   mvn clean install
   mvn spring-boot:run
   ```
3. The backend will start on `http://localhost:8080`.

### Frontend

1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. The frontend will start on `http://localhost:3000`.

## Configuration
- Backend configuration: `backend/src/main/resources/application.properties`
- Frontend API base URL: Update in `frontend/lib/api.js` if needed.
