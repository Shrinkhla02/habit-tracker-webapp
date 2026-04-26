# How to Start the Backend Server

## Quick Start

1. Open a new terminal/command prompt
2. Navigate to the backend folder:
   ```bash
   cd SAAS-backend
   ```
3. Start the server:
   ```bash
   npm start
   ```
   
   OR for development with auto-reload:
   ```bash
   npm run dev
   ```

## What You Should See

When the server starts successfully, you should see:
```
Connected to MongoDB
Server running on port 5000
```

## Troubleshooting

### If you see "MongoDB connection error":
- Make sure MongoDB is installed and running
- MongoDB should be running on: `mongodb://127.0.0.1:27017`
- Or update the MONGODB_URI in `.env` file

### If you see "EADDRINUSE" error:
- Port 5000 is already in use
- Either stop the other application, or change PORT in `.env` file

### To check if server is running:
- Open browser and go to: http://localhost:5000/api/health
- You should see: `{"message":"Server is running"}`

## Required: MongoDB

Make sure MongoDB is installed and running before starting the backend server!

