const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

app.use(cors()); // Allow frontend to call backend

app.get('/', (req, res) => {
  res.send('SAAS Backend is working!');
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'SAAS Backend API is reachable' });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
