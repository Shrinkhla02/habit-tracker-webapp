# SAAS Backend

## Setup

1. Create a `.env` file in this folder with:
   - MONGODB_URI=mongodb://127.0.0.1:27017/saas
   - PORT=5000
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

## Notes

- CORS is limited to `http://localhost:3000` for the frontend during development.
- Node version: `>=18 <23`.

## Endpoints

- GET `/` → "API is running"
- GET `/api/health` → `{ message: "Server is running" }`
- Habits API: `/api/habits`
- Habit Logs API: `/api/habitLogs`

