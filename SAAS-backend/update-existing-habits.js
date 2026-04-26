const mongoose = require('mongoose');
const Habit = require('./models/Habit');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

async function updateExistingHabits() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔄 Updating existing habits with reminder fields...\n');

    // First, check how many habits need updating
    const habitsWithoutReminderTime = await Habit.countDocuments({
      $or: [
        { reminderTime: { $exists: false } },
        { reminderDate: { $exists: false } }
      ]
    });

    console.log(`Found ${habitsWithoutReminderTime} habit(s) that need updating`);

    if (habitsWithoutReminderTime === 0) {
      console.log('✅ All habits already have reminder fields!');
      mongoose.connection.close();
      return;
    }

    // Update all habits that don't have reminderTime or reminderDate
    const result = await Habit.updateMany(
      {
        $or: [
          { reminderTime: { $exists: false } },
          { reminderDate: { $exists: false } }
        ]
      },
      {
        $set: {
          reminderTime: 'None',
          reminderDate: null
        }
      }
    );

    console.log(`\n✅ Successfully updated ${result.modifiedCount} habit(s)`);
    console.log('   - Set reminderTime: "None"');
    console.log('   - Set reminderDate: null');

    // Verify the update
    const allHabits = await Habit.find().limit(3);
    console.log('\n📋 Sample habits after update:');
    console.log('─'.repeat(80));
    allHabits.forEach((habit, index) => {
      console.log(`${index + 1}. ${habit.name}`);
      console.log(`   reminderTime: ${habit.reminderTime}`);
      console.log(`   reminderDate: ${habit.reminderDate}`);
      console.log('');
    });

    console.log('✅ All done! Your habits now have reminder fields.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

updateExistingHabits();
