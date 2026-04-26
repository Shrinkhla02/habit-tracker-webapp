const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Habit = require('../models/Habit');
const User = require('../model/user');
const Subscription = require('../model/subscription');

// Configure test target: Azure endpoint OR local app
const AZURE_ENDPOINT = process.env.AZURE_ENDPOINT;
const testTarget = AZURE_ENDPOINT || app;
const isAzureTesting = !!AZURE_ENDPOINT;

console.log(`Running tests against: ${AZURE_ENDPOINT || 'local app'}`);

describe('Habit API - POST /api/habits Tests', () => {
  let testUserId = 'test-user-123';
  let proUserId = 'pro-user-456';
  let premiumUserId = 'premium-user-789';

  beforeAll(async () => {
    if (!isAzureTesting && mongoose.connection.readyState === 0) {
      await mongoose.connect(
        process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/saas-test',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );
    }
  });

  beforeEach(async () => {
    if (!isAzureTesting) {
      await Habit.deleteMany({});
      await User.deleteMany({});
      await Subscription.deleteMany({});

      await User.create([
        { 
          userId: testUserId,
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'password123',
          isPro: false
        },
        { 
          userId: proUserId,
          name: 'Pro User',
          email: 'prouser@example.com',
          password: 'password123',
          isPro: true
        },
        { 
          userId: premiumUserId,
          name: 'Premium User',
          email: 'premiumuser@example.com',
          password: 'password123',
          isPro: false
        }
      ]);

      await Subscription.create([
        { 
          subscriptionId: 'sub_test_123',
          userId: testUserId, 
          planType: 'basic', 
          isActive: true,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        },
        { 
          subscriptionId: 'sub_premium_789',
          userId: premiumUserId, 
          planType: 'premium', 
          isActive: true,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      ]);
    }
  });

  afterAll(async () => {
    if (!isAzureTesting) {
      await Habit.deleteMany({});
      await User.deleteMany({});
      await Subscription.deleteMany({});
      await mongoose.connection.close();
    }
  });

  // Basic Tests
  describe('Basic POST Functionality', () => {
    test('TC-001: Should create habit with required fields', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Morning Exercise'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Habit created successfully');
      expect(response.body.data.name).toBe('Morning Exercise');
    });

    test('TC-002: Should create habit with all fields', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Meditation',
          description: 'Daily meditation',
          category: 'health',
          frequency: 'daily',
          reminder: 'morning',
          notes: 'Use app',
          reminderTime: '08:00',
          daysOfWeek: ['mon', 'wed', 'fri']
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description).toBe('Daily meditation');
    });

    test('TC-003: Should apply default values', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Read Books'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.reminder).toBe('morning');
      expect(response.body.data.frequency).toBe('daily');
      expect(response.body.data.category).toBe('other');
    });

    test('TC-004: Should trim whitespace', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: '  Test Habit  '
        })
        .expect(201);

      expect(response.body.data.name).toBe('Test Habit');
    });
  });

  // Validation Tests
  describe('Validation Tests', () => {
    test('TC-005: Should fail without userId', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({ name: 'Test Habit' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('userId and name are required');
    });

    test('TC-006: Should fail without name', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({ userId: testUserId })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('userId and name are required');
    });

    test('TC-007: Should fail with invalid category', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Test',
          category: 'invalid'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('TC-008: Should fail with invalid reminder', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Test',
          reminder: 'invalid'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('TC-009: Should fail with invalid frequency', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Test',
          frequency: 'yearly'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('TC-010: Should fail with invalid daysOfWeek', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Test',
          daysOfWeek: ['invalid']
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('TC-011: Should fail with dayOfMonth < 1', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Test',
          dayOfMonth: 0
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('TC-012: Should fail with dayOfMonth > 31', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Test',
          dayOfMonth: 32
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // Subscription Limit Tests
  describe('Subscription Limits', () => {
    test('TC-013: Basic user limited to 3 habits', async () => {
      // Create 3 habits
      for (let i = 1; i <= 3; i++) {
        await request(testTarget)
          .post('/api/habits')
          .send({
            userId: testUserId,
            name: `Habit ${i}`
          })
          .expect(201);
      }

      // 4th should fail
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Habit 4'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Habit limit reached');
    });

    test('TC-014: Premium user limited to 10 habits', async () => {
      // Create 10 habits
      for (let i = 1; i <= 10; i++) {
        await request(testTarget)
          .post('/api/habits')
          .send({
            userId: premiumUserId,
            name: `Premium Habit ${i}`
          })
          .expect(201);
      }

      // 11th should fail
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: premiumUserId,
          name: 'Habit 11'
        })
        .expect(403);

      expect(response.body.message).toContain('10 habits');
    });

    test('TC-015: Pro user has unlimited habits', async () => {
      // Create 15 habits
      for (let i = 1; i <= 15; i++) {
        const response = await request(testTarget)
          .post('/api/habits')
          .send({
            userId: proUserId,
            name: `Pro Habit ${i}`
          })
          .expect(201);

        expect(response.body.success).toBe(true);
      }
    });

    test('TC-016: Only active habits count towards limit', async () => {
      if (!isAzureTesting) {
        // Create 3 active habits
        for (let i = 1; i <= 3; i++) {
          await Habit.create({
            userId: testUserId,
            name: `Active Habit ${i}`,
            isActive: true
          });
        }

        // Create 2 inactive habits
        await Habit.create({
          userId: testUserId,
          name: 'Inactive 1',
          isActive: false
        });
        await Habit.create({
          userId: testUserId,
          name: 'Inactive 2',
          isActive: false
        });

        // Try to create another active habit - should fail
        const response = await request(testTarget)
          .post('/api/habits')
          .send({
            userId: testUserId,
            name: 'New Active',
            isActive: true
          })
          .expect(403);

        expect(response.body.message).toContain('Habit limit reached');
      }
    });

    test('TC-017: User without subscription defaults to basic', async () => {
      if (!isAzureTesting) {
        const newUserId = 'no-sub-user';
        
        await User.create({ 
          userId: newUserId,
          name: 'No Sub User',
          email: 'nosub@example.com',
          password: 'password123',
          isPro: false 
        });

        // Create 3 habits
        for (let i = 1; i <= 3; i++) {
          await request(testTarget)
            .post('/api/habits')
            .send({
              userId: newUserId,
              name: `Habit ${i}`
            })
            .expect(201);
        }

        // 4th should fail
        const response = await request(testTarget)
          .post('/api/habits')
          .send({
            userId: newUserId,
            name: 'Habit 4'
          })
          .expect(403);

        expect(response.body.message).toContain('3 habits');
      }
    });

    test('TC-018: Inactive subscription defaults to basic', async () => {
      if (!isAzureTesting) {
        const inactiveUserId = 'inactive-sub-user';
        
        await User.create({ 
          userId: inactiveUserId,
          name: 'Inactive Sub User',
          email: 'inactivesub@example.com',
          password: 'password123',
          isPro: false 
        });

        await Subscription.create({
          subscriptionId: 'sub_inactive_001',
          userId: inactiveUserId,
          planType: 'premium',
          isActive: false,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        });

        // Should be limited to 3
        for (let i = 1; i <= 3; i++) {
          await request(testTarget)
            .post('/api/habits')
            .send({
              userId: inactiveUserId,
              name: `Habit ${i}`
            })
            .expect(201);
        }

        const response = await request(testTarget)
          .post('/api/habits')
          .send({
            userId: inactiveUserId,
            name: 'Habit 4'
          })
          .expect(403);

        expect(response.body.message).toContain('3 habits');
      }
    });

    test('TC-019: isPro flag overrides subscription', async () => {
      if (!isAzureTesting) {
        const proFlagUserId = 'pro-flag-user';
        
        await User.create({ 
          userId: proFlagUserId,
          name: 'Pro Flag User',
          email: 'proflag@example.com',
          password: 'password123',
          isPro: true 
        });

        await Subscription.create({
          subscriptionId: 'sub_proflag_001',
          userId: proFlagUserId,
          planType: 'basic',
          isActive: true,
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        });

        // Should be able to create more than 3
        for (let i = 1; i <= 10; i++) {
          const response = await request(testTarget)
            .post('/api/habits')
            .send({
              userId: proFlagUserId,
              name: `Habit ${i}`
            })
            .expect(201);

          expect(response.body.success).toBe(true);
        }
      }
    });
  });

  // Reminder & Frequency Tests
  describe('Reminder and Frequency Tests', () => {
    test('TC-020: Should accept all valid reminders', async () => {
      const reminders = ['morning', 'afternoon', 'evening'];

      for (const reminder of reminders) {
        const response = await request(testTarget)
          .post('/api/habits')
          .send({
            userId: proUserId,
            name: `${reminder} habit`,
            reminder: reminder
          })
          .expect(201);

        expect(response.body.data.reminder).toBe(reminder);
      }
    });

    test('TC-021: Should accept all valid frequencies', async () => {
      const frequencies = ['daily', 'weekly', 'monthly'];

      for (const frequency of frequencies) {
        const response = await request(testTarget)
          .post('/api/habits')
          .send({
            userId: proUserId,
            name: `${frequency} habit`,
            frequency: frequency
          })
          .expect(201);

        expect(response.body.data.frequency).toBe(frequency);
      }
    });

    test('TC-022: Should accept daysOfWeek', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Weekday habit',
          daysOfWeek: ['mon', 'wed', 'fri']
        })
        .expect(201);

      expect(response.body.data.daysOfWeek).toEqual(['mon', 'wed', 'fri']);
    });

    test('TC-023: Should accept all days', async () => {
      const allDays = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Daily habit',
          daysOfWeek: allDays
        })
        .expect(201);

      expect(response.body.data.daysOfWeek).toEqual(allDays);
    });

    test('TC-024: Should accept dayOfMonth', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Monthly habit',
          dayOfMonth: 15
        })
        .expect(201);

      expect(response.body.data.dayOfMonth).toBe(15);
    });

    test('TC-025: Should accept boundary dayOfMonth', async () => {
      const response1 = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: proUserId,
          name: 'First day',
          dayOfMonth: 1
        })
        .expect(201);

      expect(response1.body.data.dayOfMonth).toBe(1);

      const response31 = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: proUserId,
          name: 'Last day',
          dayOfMonth: 31
        })
        .expect(201);

      expect(response31.body.data.dayOfMonth).toBe(31);
    });
  });

  // Category Tests
  describe('Category Tests', () => {
    test('TC-026: Should accept all valid categories', async () => {
      const categories = ['health', 'fitness', 'learning', 'productivity', 'other'];

      for (const category of categories) {
        const response = await request(testTarget)
          .post('/api/habits')
          .send({
            userId: proUserId,
            name: `${category} habit`,
            category: category
          })
          .expect(201);

        expect(response.body.data.category).toBe(category);
      }
    });

    test('TC-027: Should use default category', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Uncategorized'
        })
        .expect(201);

      expect(response.body.data.category).toBe('other');
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    test('TC-028: Should handle special characters', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Test @#$% 123!'
        })
        .expect(201);

      expect(response.body.data.name).toBe('Test @#$% 123!');
    });

    
    test('TC-030: Should initialize streaks', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'New Habit'
        })
        .expect(201);

      expect(response.body.data.currentStreak).toBe(0);
      expect(response.body.data.bestStreak).toBe(0);
    });
  });

  // Timestamp Tests
  describe('Timestamps', () => {
    test('TC-031: Should set timestamps', async () => {
      const response = await request(testTarget)
        .post('/api/habits')
        .send({
          userId: testUserId,
          name: 'Timestamp Test'
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
      expect(new Date(response.body.data.createdAt)).toBeInstanceOf(Date);
    });
  });
});