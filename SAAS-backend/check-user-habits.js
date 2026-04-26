const mongoose = require('mongoose');
const Habit = require('./models/Habit');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function checkUserHabits() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get all unique user IDs
    const userIds = await Habit.distinct('userId');
    console.log(`📊 Found ${userIds.length} unique user(s) with habits:\n`);

    for (const userId of userIds) {
      const habits = await Habit.find({ userId });
      console.log(`User ID: ${userId}`);
      console.log(`Habits count: ${habits.length}`);
      console.log('Habits:');
      habits.forEach((habit, index) => {
        console.log(`  ${index + 1}. ${habit.name}`);
        console.log(`     - Category: ${habit.category}`);
        console.log(`     - Reminder: ${habit.reminder}`);
        console.log(`     - Reminder Time: ${habit.reminderTime || 'None'}`);
        console.log(`     - Reminder Date: ${habit.reminderDate || 'Not set'}`);
      });
      console.log('');
    }

    console.log('\n💡 Tips:');
    console.log('1. Copy one of the User IDs above');
    console.log('2. Login with a user that has this userId');
    console.log('3. Navigate to /reminders page');
    console.log('4. You should see the habits listed above');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkUserHabits();
