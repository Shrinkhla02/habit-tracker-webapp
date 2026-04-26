const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function dropWrongHabitsIndex() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Missing MONGODB_URI in .env');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const habits = db.collection('habits');

  const indexes = await habits.indexes();
  const wrong = indexes.find(i => i.name === 'habitId_1');
  if (wrong) {
    await habits.dropIndex('habitId_1');
    console.log('Dropped index habitId_1 from habits collection');
  } else {
    console.log('No habitId_1 index found on habits');
  }

  await mongoose.disconnect();
}

dropWrongHabitsIndex().catch(async (err) => {
  console.error('Fix indexes failed:', err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});



