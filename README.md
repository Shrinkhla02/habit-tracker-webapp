# Habit Tracker App

A full-stack Habit Tracker web application that enables users to create, manage, and track daily habits with authentication, reminders, and progress tracking.

---

## Features

- User authentication and authorization using JWT
- Create, update, and delete daily habits
- Track habit completion status
- Automated reminders using scheduled cron jobs
- RESTful APIs for all core operations
- Secure backend with token-based authentication
- Responsive frontend for user-friendly experience

---

## Tech Stack

Frontend:
- React.js

Backend:
- Node.js
- Express.js

Database:
- MongoDB

Authentication:
- JSON Web Tokens (JWT)

Deployment:
- Microsoft Azure

---

## Project Structure
habit-tracker-app/
│
├── client/ # React frontend
│ ├── src/
│ └── public/
│
├── server/ # Express backend
│ ├── controllers/
│ ├── models/
│ ├── routes/
│ ├── middleware/
│ ├── config/
│ └── server.js
│
├── .env
├── package.json
└── README.md

---

## Architecture
Client (React)
|
| REST API calls with JWT authentication
v
Backend (Express.js)
|
| Business logic and cron-based scheduling
|
v
Database (MongoDB)

### Flow

1. User registers or logs in through the frontend  
2. Backend validates credentials and generates a JWT token  
3. Token is used for accessing protected routes  
4. User creates and manages habits  
5. Data is stored and retrieved from MongoDB  
6. Cron jobs run periodically to check and trigger reminders for pending habits  

---

## Authentication Flow

- User registration and login implemented with secure password hashing  
- JWT token is issued upon successful authentication  
- Token is passed in request headers for protected APIs  
- Middleware verifies token before granting access to secured routes  

---

## Reminder System

- Cron jobs execute at scheduled intervals  
- System checks incomplete habits for users  
- Reminder logic is triggered based on scheduled tasks  
- Helps users maintain consistency in habit tracking  

---

## API Endpoints

### Authentication
- POST /api/auth/register → Register a new user  
- POST /api/auth/login → Login user  

### Habits
- GET /api/habits → Fetch all habits  
- POST /api/habits → Create a new habit  
- PUT /api/habits/:id → Update an existing habit  
- DELETE /api/habits/:id → Delete a habit  

---

## Deployment

- Backend deployed on Microsoft Azure App Service  
- MongoDB Atlas used as cloud database  
- Environment variables configured securely  
- CORS enabled for secure frontend-backend communication  

---

## Future Enhancements

- Push notification support for reminders  
- Habit streak tracking and analytics dashboard  
- Gamification features to improve engagement  
- Mobile application using React Native  
- Social sharing of habit progress  

---

## Author

This project was developed as a full-stack application to demonstrate CRUD operations, authentication, scheduling, and cloud deployment using modern web technologies.
