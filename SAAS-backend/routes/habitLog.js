const express = require('express');
const router = express.Router();
const habitLogController = require('../controllers/habitLogController');

// GET all habit logs
router.get('/', habitLogController.getAll);

// GET all logs for a specific habit
// URL: GET /api/habitLogs/habit/:habitId
router.get('/habit/:habitId', habitLogController.getHabitLogs);

// GET a specific log by ID
// URL: GET /api/habitLogs/:id
router.get('/:id', habitLogController.getHabitLogById);

// POST create a new log (mark habit completed)
// URL: POST /api/habitLogs
router.post('/', habitLogController.createHabitLog);

// PUT update a log
// URL: PUT /api/habitLogs/:id
router.put('/:id', habitLogController.updateHabitLog);

// DELETE a log
// URL: DELETE /api/habitLogs/:id
router.delete('/:id', habitLogController.deleteHabitLog);

module.exports = router;