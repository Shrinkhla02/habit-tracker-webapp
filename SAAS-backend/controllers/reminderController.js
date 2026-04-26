const Reminder = require('../model/reminder');

// Get all reminders
exports.getAllReminders = async (req, res) => {
  try {
    console.log('GET /api/reminders/all - Fetching reminders...');
    const reminders = await Reminder.find().sort({ createdAt: -1 });
    console.log(`Found ${reminders.length} reminders`);
    res.status(200).json({ success: true, data: reminders });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update reminder time
exports.updateReminderTime = async (req, res) => {
  try {
    const { reminderId, date, time } = req.body;
    if (!reminderId || !date || !time) {
      return res.status(400).json({ success: false, message: 'Missing reminderId, date, or time' });
    }
    const updated = await Reminder.findByIdAndUpdate(
      reminderId,
      { date, time },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
