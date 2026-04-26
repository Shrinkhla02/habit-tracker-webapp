// Main imports - we need mongoose to work with MongoDB and our model files
const mongoose = require('mongoose');

// Simple helper function to generate unique IDs for our sample data
// This creates IDs like "user_1730073600000_abc123def" - timestamp + random string
const generateId = (prefix) => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Import all our database models - these define the structure of our data
const User = require('./model/user');
const AuthToken = require('./model/authToken');
const Subscription = require('./model/subscription');
const Habit = require('./model/habit');
const HabitCompletion = require('./model/habitCompletion');
const Reminder = require('./model/reminder');
const Report = require('./model/report');

// MongoDB Atlas connection function
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect('mongodb+srv://skaranam_db_user:1XJVMsqzGurXtM7H@cluster1.wywgal3.mongodb.net/saas_habit_tracker');
    console.log('✅ MongoDB Connected');
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Here's all our sample data - this represents what a real app might have
// We're creating realistic users, habits, and activity to test our system
// Sample Users - We're creating 3 different types of users to test our system
// This gives us a Pro user, a Basic user, and another Pro user with different data
const sampleUsers = [
  {
    userId: 'user_001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'hashedPassword123', // In real life, this would be properly hashed
    isPro: true, // This user has a premium subscription
    createdAt: new Date('2024-01-15'), // Account created in January
    updatedAt: new Date('2024-10-20')  // Recently updated profile
  },
  {
    userId: 'user_002', 
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    password: 'hashedPassword456',
    isPro: false, // Basic user - no premium features
    createdAt: new Date('2024-02-10'), // Joined a month after John
    updatedAt: new Date('2024-10-18')
  },
  {
    userId: 'user_003',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com', 
    password: 'hashedPassword789',
    isPro: true, // Another Pro user for testing premium features
    createdAt: new Date('2024-03-05'), // Newest user
    updatedAt: new Date('2024-10-25') // Most recently active
  }
];

// Authentication tokens - these would be used to keep users logged in
// In a real app, these would be JWT tokens or similar secure tokens
const sampleAuthTokens = [
  {
    tokenId: 'token_001',
    userId: 'user_001', // This token belongs to John Doe
    tokenValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample1', // Fake JWT token
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Expires in 24 hours
  },
  {
    tokenId: 'token_002',
    userId: 'user_002', // Jane's token
    tokenValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample2',
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Also expires in 24 hours
  },
  {
    tokenId: 'token_003',
    userId: 'user_003', // Mike's token
    tokenValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sample3', 
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // All tokens expire tomorrow
  }
];

// User subscriptions - this tracks what plan each user is paying for
// We have different plan types and some active/inactive subscriptions
const sampleSubscriptions = [
  {
    subscriptionId: 'sub_001',
    userId: 'user_001', // John's subscription
    planType: 'pro', // Top tier plan with all features
    startDate: new Date('2024-01-15'), // Started when he joined
    endDate: new Date('2025-01-15'), // Valid for a full year
    isActive: true // Currently paying and active
  },
  {
    subscriptionId: 'sub_002',
    userId: 'user_002', // Jane's subscription
    planType: 'basic', // Entry level plan
    startDate: new Date('2024-02-10'), // Started when she joined
    endDate: new Date('2024-03-10'), // Only lasted a month
    isActive: false // She cancelled or it expired
  },
  {
    subscriptionId: 'sub_003',
    userId: 'user_003', // Mike's subscription
    planType: 'premium', // Middle tier plan
    startDate: new Date('2024-03-05'), // Started when he joined
    endDate: new Date('2024-09-05'), // 6 months duration
    isActive: true // Still active and paying
  }
];

// The heart of our app - user habits that they want to track
// We're creating different types of habits to test various features
const sampleHabits = [
  {
    habitId: 'habit_001',
    userId: 'user_001', // This is John's habit
    name: 'Morning Exercise', // Simple, clear name
    description: 'Daily 30-minute workout routine', // More details about what he does
    frequency: 'daily', // He wants to do this every day
    reminderTime: '07:00', // Remind him at 7 AM
    category: 'fitness', // Categorized for filtering and analytics
    isActive: true, // He's still working on this habit
    createdAt: new Date('2024-01-20'), // Started a few days after joining
    updatedAt: new Date('2024-10-20') // Recently updated the details
  },
  {
    habitId: 'habit_002',
    userId: 'user_001', // John's second habit - showing users can have multiple habits
    name: 'Read Books',
    description: 'Read for at least 20 minutes daily', // Setting a minimum time goal
    frequency: 'daily', // Also daily like his exercise
    reminderTime: '20:00', // Evening reading - 8 PM reminder
    category: 'learning', // Different category for variety
    isActive: true, // Still active
    createdAt: new Date('2024-01-25'), // Added a few days after his first habit
    updatedAt: new Date('2024-10-15') // Updated more recently than his exercise habit
  },
  {
    habitId: 'habit_003',
    userId: 'user_002', // Jane's habit - she focuses on wellness
    name: 'Meditation',
    description: 'Daily mindfulness practice', // Simple but important for mental health
    frequency: 'daily', // Every day like the others
    reminderTime: '06:30', // Early morning meditation - 6:30 AM
    category: 'health', // Health category, different from fitness
    isActive: true, // She's keeping this up despite canceling her subscription
    createdAt: new Date('2024-02-15'), // Added a few days after joining
    updatedAt: new Date('2024-10-18') // Recently updated
  },
  {
    habitId: 'habit_004',
    userId: 'user_003', // Mike's habit - he's focused on productivity
    name: 'Weekly Planning',
    description: 'Plan the upcoming week', // Less frequent but important planning habit
    frequency: 'weekly', // Only once per week - different frequency for variety
    reminderTime: '09:00', // Sunday morning planning session
    category: 'productivity', // Work/life organization
    isActive: true, // Still planning weekly
    createdAt: new Date('2024-03-10'), // Added shortly after joining
    updatedAt: new Date('2024-10-25') // Most recently updated
  }
];

// Habit completions - this tracks when users actually did their habits
// This data is crucial for streak tracking and progress analytics
const sampleHabitCompletions = [
  {
    completionId: 'comp_001',
    habitId: 'habit_001', // John completed his morning exercise
    userId: 'user_001',
    completionDate: new Date('2024-10-27'), // Yesterday - recent activity
    isManual: true, // He manually marked it as complete (vs automatic tracking)
    createdAt: new Date('2024-10-27') // Logged the same day
  },
  {
    completionId: 'comp_002',
    habitId: 'habit_001', // John's exercise again - building a streak
    userId: 'user_001', 
    completionDate: new Date('2024-10-26'), // Day before that
    isManual: true, // Also manually logged
    createdAt: new Date('2024-10-26') // Shows consistent tracking
  },
  {
    completionId: 'comp_003',
    habitId: 'habit_002', // John also completed his reading habit
    userId: 'user_001',
    completionDate: new Date('2024-10-27'), // Same day as his exercise
    isManual: false, // This was automatically tracked (maybe via app integration)
    createdAt: new Date('2024-10-27') // Good day for John - completed multiple habits
  },
  {
    completionId: 'comp_004',
    habitId: 'habit_003', // Jane completed her meditation
    userId: 'user_002',
    completionDate: new Date('2024-10-27'), // Also yesterday - users are active
    isManual: true, // She manually logged it
    createdAt: new Date('2024-10-27') // Recent engagement even without paid subscription
  }
];

// Reminders help users stay on track with their habits
// Some are enabled, some disabled to show different user preferences
const sampleReminders = [
  {
    reminderId: 'rem_001',
    habitId: 'habit_001', // Reminder for John's morning exercise
    timeOfDay: '07:00', // 7 AM reminder matches his habit schedule
    isEnabled: true, // He wants to keep getting these reminders
    createdAt: new Date('2024-01-20') // Created when he set up the habit
  },
  {
    reminderId: 'rem_002',
    habitId: 'habit_002', // Reminder for John's reading habit
    timeOfDay: '20:00', // 8 PM reminder for evening reading
    isEnabled: true, // Also enabled - John likes his reminders
    createdAt: new Date('2024-01-25') // Created when he added the reading habit
  },
  {
    reminderId: 'rem_003',
    habitId: 'habit_003', // Reminder for Jane's meditation
    timeOfDay: '06:30', // Early morning meditation reminder
    isEnabled: true, // She finds the reminder helpful
    createdAt: new Date('2024-02-15') // Set up with her meditation habit
  },
  {
    reminderId: 'rem_004',
    habitId: 'habit_004', // Reminder for Mike's weekly planning
    timeOfDay: '09:00', // Sunday morning planning time
    isEnabled: false, // He turned this off - maybe he remembers on his own
    createdAt: new Date('2024-03-10') // Originally created with the habit
  }
];

// Analytics reports - this shows user progress and habit statistics
// Great for showing users how they're doing and motivating them
const sampleReports = [
  {
    reportId: 'rep_001',
    userId: 'user_001', // John's weekly progress report
    completionRate: 85.5, // He's doing great - 85.5% completion rate
    totalCompleted: 17, // Completed 17 habits this week
    totalHabits: 2, // He has 2 active habits (exercise + reading)
    streak: 5, // 5-day streak - he's building consistency
    dateRange: 'weekly', // This report covers the past week
    generatedAt: new Date('2024-10-27') // Generated yesterday
  },
  {
    reportId: 'rep_002',
    userId: 'user_002', // Jane's weekly report
    completionRate: 75.0, // Good but not as high as John - 75% completion
    totalCompleted: 12, // Completed 12 habits this week
    totalHabits: 1, // She only has 1 active habit (meditation)
    streak: 3, // 3-day streak - building but shorter than John's
    dateRange: 'weekly', // Also weekly report
    generatedAt: new Date('2024-10-26') // Generated day before John's
  },
  {
    reportId: 'rep_003',
    userId: 'user_003', // Mike's monthly report
    completionRate: 90.0, // Highest completion rate - he's very consistent
    totalCompleted: 4, // Only 4 completions but that makes sense...
    totalHabits: 1, // ...because he only has 1 habit that's weekly, not daily
    streak: 2, // 2-week streak for his weekly planning habit
    dateRange: 'monthly', // Monthly report instead of weekly
    generatedAt: new Date('2024-10-25') // Generated a couple days ago
  }
];

// Real database population functions
const populateUsers = async () => {
  try {
    console.log('👥 Populating users...');
    await User.deleteMany({}); // Clear existing users
    await User.insertMany(sampleUsers);
    console.log(`✅ Users populated successfully (${sampleUsers.length} users)`);
  } catch (error) {
    console.error('❌ Error populating users:', error.message);
    throw error;
  }
};

const populateAuthTokens = async () => {
  try {
    console.log('🔐 Populating auth tokens...');
    await AuthToken.deleteMany({}); // Clear existing tokens
    await AuthToken.insertMany(sampleAuthTokens);
    console.log(`✅ Auth tokens populated successfully (${sampleAuthTokens.length} tokens)`);
  } catch (error) {
    console.error('❌ Error populating auth tokens:', error.message);
    throw error;
  }
};

const populateSubscriptions = async () => {
  try {
    console.log('💳 Populating subscriptions...');
    await Subscription.deleteMany({}); // Clear existing subscriptions
    await Subscription.insertMany(sampleSubscriptions);
    console.log(`✅ Subscriptions populated successfully (${sampleSubscriptions.length} subscriptions)`);
  } catch (error) {
    console.error('❌ Error populating subscriptions:', error.message);
    throw error;
  }
};

const populateHabits = async () => {
  try {
    console.log('🎯 Populating habits...');
    await Habit.deleteMany({}); // Clear existing habits
    await Habit.insertMany(sampleHabits);
    console.log(`✅ Habits populated successfully (${sampleHabits.length} habits)`);
  } catch (error) {
    console.error('❌ Error populating habits:', error.message);
    throw error;
  }
};

const populateHabitCompletions = async () => {
  try {
    console.log('✅ Populating habit completions...');
    await HabitCompletion.deleteMany({}); // Clear existing completions
    await HabitCompletion.insertMany(sampleHabitCompletions);
    console.log(`✅ Habit completions populated successfully (${sampleHabitCompletions.length} completions)`);
  } catch (error) {
    console.error('❌ Error populating habit completions:', error.message);
    throw error;
  }
};

const populateReminders = async () => {
  try {
    console.log('⏰ Populating reminders...');
    await Reminder.deleteMany({}); // Clear existing reminders
    await Reminder.insertMany(sampleReminders);
    console.log(`✅ Reminders populated successfully (${sampleReminders.length} reminders)`);
  } catch (error) {
    console.error('❌ Error populating reminders:', error.message);
    throw error;
  }
};

const populateReports = async () => {
  try {
    console.log('📊 Populating reports...');
    await Report.deleteMany({}); // Clear existing reports
    await Report.insertMany(sampleReports);
    console.log(`✅ Reports populated successfully (${sampleReports.length} reports)`);
  } catch (error) {
    console.error('❌ Error populating reports:', error.message);
    throw error;
  }
};

// This is the main function that runs everything
// It calls all the individual populate functions in the right order
const populateDatabase = async () => {
  let connection;
  try {
    console.log('🚀 Starting database population...\n');
    
    // First, connect to the database
    connection = await connectDB();
    
    // Populate collections in order - users first, then things that depend on users
    await populateUsers(); // Start with users - everything else depends on them
    await populateAuthTokens(); // Then their login tokens
    await populateSubscriptions(); // Their subscription plans
    await populateHabits(); // Their habits
    await populateHabitCompletions(); // Records of when they completed habits
    await populateReminders(); // Reminder settings for habits
    await populateReports(); // Finally, analytics reports based on their activity
    
    console.log('\n🎉 Database population completed successfully!');
    
    // Display summary of populated data
    console.log('\n📊 Population Summary:');
    console.log(`Users: ${sampleUsers.length}`);
    console.log(`Auth Tokens: ${sampleAuthTokens.length}`);
    console.log(`Subscriptions: ${sampleSubscriptions.length}`);
    console.log(`Habits: ${sampleHabits.length}`);
    console.log(`Habit Completions: ${sampleHabitCompletions.length}`);
    console.log(`Reminders: ${sampleReminders.length}`);
    console.log(`Reports: ${sampleReports.length}`);
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    if (connection) {
      console.log('\n🔌 Closing database connection...');
      await connection.disconnect();
    }
    process.exit(0);
  }
};

// This part runs the script when you call "node populate.js"
// It won't run if this file is imported by another file
if (require.main === module) {
  populateDatabase();
}

// Export the functions and data so other files can use them if needed
module.exports = {
  populateDatabase,
  sampleUsers,
  sampleHabits,
  sampleHabitCompletions
};