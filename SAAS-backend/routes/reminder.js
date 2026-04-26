const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');

// Get all reminders
router.get('/all', reminderController.getAllReminders);

// Update reminder time
router.put('/update', reminderController.updateReminderTime);

module.exports = router;
