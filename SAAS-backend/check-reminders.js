const mongoose = require('mongoose');
const Reminder = require('./model/reminder');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://skaranam_db_user:1XJVMsqzGurXtM7H@cluster1.wywgal3.mongodb.net/saas_habit_tracker';

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('Connected to MongoDB');
  const reminders = await Reminder.find();
  console.log('Total reminders:', reminders.length);
  console.log('Reminders:', JSON.stringify(reminders, null, 2));
  mongoose.connection.close();
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
