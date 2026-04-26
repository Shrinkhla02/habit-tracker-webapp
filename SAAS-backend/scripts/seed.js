const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');

async function readJson(filePath) {
  const abs = path.join(__dirname, '..', 'data', filePath);
  const raw = fs.readFileSync(abs, 'utf-8');
  return JSON.parse(raw);
}

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Missing MONGODB_URI in .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  // Use a single synthetic userId for all seed data
  const seededUserId = new mongoose.Types.ObjectId();
  console.log('Using seeded userId:', seededUserId.toString());

  // Seed Habits
  const habitSeed = await readJson('HabitSeed.json');
  const habitsToInsert = habitSeed.map(h => ({
    userId: seededUserId,
    name: h.name,
    description: h.description,
    reminder: h.reminder,
    frequency: h.frequency,
    category: h.category,
    isActive: typeof h.isActive === 'boolean' ? h.isActive : true
  }));

  await Habit.deleteMany({ userId: seededUserId });
  const insertedHabits = await Habit.insertMany(habitsToInsert);
  console.log(`Inserted habits: ${insertedHabits.length}`);

  // Optionally seed HabitLogs by creating a simple completed log for each inserted habit
  const logsToInsert = insertedHabits.map(habit => ({
    habitId: habit._id,
    userId: seededUserId,
    completedDate: new Date(),
    isCompleted: true,
    notes: 'Seeded log'
  }));

  await HabitLog.deleteMany({ userId: seededUserId });
  const insertedLogs = await HabitLog.insertMany(logsToInsert);
  console.log(`Inserted habit logs: ${insertedLogs.length}`);

  console.log('Seed complete. Query habits with:', `/api/habits/user/${seededUserId.toString()}`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('Seed failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});


