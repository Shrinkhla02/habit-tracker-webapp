const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Habit = require('../models/Habit');
const habitController = require('../controllers/habitController');

jest.mock('../models/Habit');

const app = express();
app.use(express.json());
app.get('/api/habits/user/:userId', habitController.getAllHabits);
app.get('/api/habits/:id', habitController.getHabitById);

describe('Habit GET API Tests', () => {
  let testHabitId;
  let testUserId;

  beforeAll(() => {
    testHabitId = new mongoose.Types.ObjectId();
    testUserId = 'user_' + Date.now();
    console.log('\n==============================================');
    console.log('Habit GET API Test Suite Starting');
    console.log('==============================================');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/habits/user/:userId - Get Habits by User', () => {
    
    test('TEST 1: Should return array of habits for valid user ID', async () => {
      console.log('\nTEST 1: Get Habits by Valid User ID');
      console.log('URL: GET /api/habits/user/:userId');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habits/user/' + testUserId);
      
      const mockHabits = [
        {
          _id: testHabitId,
          userId: testUserId,
          name: 'Morning Exercise',
          description: 'Daily workout routine',
          reminder: 'morning',
          frequency: 'daily',
          category: 'health'
        },
        {
          _id: new mongoose.Types.ObjectId(),
          userId: testUserId,
          name: 'Read Books',
          description: 'Read for 30 minutes',
          reminder: 'evening',
          frequency: 'daily',
          category: 'education'
        }
      ];
      
      Habit.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockHabits)
      });

      const response = await request(app)
        .get('/api/habits/user/' + testUserId)
        .expect(200);
      
      console.log('Response status: ' + response.status);
      console.log('Habits count: ' + response.body.data.length);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count', 2);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);      expect(response.body.data[0].userId).toBe(testUserId);
      expect(response.body.data[1].userId).toBe(testUserId);
      expect(Habit.find).toHaveBeenCalledWith({ userId: testUserId });
      
      console.log('TEST 1 PASSED');
    });

    test('TEST 2: Should return empty array for user with no habits', async () => {
      console.log('\nTEST 2: Get Habits for User with No Habits');
      const emptyUserId = 'user_empty_' + Date.now();
      console.log('URL: GET /api/habits/user/:userId');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habits/user/' + emptyUserId);
      
      Habit.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([])
      });

      const response = await request(app)
        .get('/api/habits/user/' + emptyUserId)
        .expect(200);
      
      console.log('Response status: ' + response.status);
      console.log('Habits count: ' + response.body.data.length);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('count', 0);      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(Habit.find).toHaveBeenCalledWith({ userId: emptyUserId });
      
      console.log('TEST 2 PASSED');
    });

    test('TEST 3: Should return 500 when database error occurs', async () => {
      console.log('\nTEST 3: Get Habits with Database Error');
      console.log('URL: GET /api/habits/user/:userId');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habits/user/' + testUserId);
      
      Habit.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      });

      const response = await request(app)
        .get('/api/habits/user/' + testUserId)
        .expect(500);
      
      console.log('Response status: ' + response.status);
      console.log('Error message: ' + response.body.message);      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(Habit.find).toHaveBeenCalledWith({ userId: testUserId });
      
      console.log('TEST 3 PASSED');
    });
  });

  describe('GET /api/habits/:id - Get Habit by ID', () => {
    
    test('TEST 4: Should return single habit when valid ID is provided', async () => {
      console.log('\nTEST 4: Get Habit by Valid ID');
      console.log('URL: GET /api/habits/:id');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habits/' + testHabitId);
      
      const mockHabit = {
        _id: testHabitId,
        userId: testUserId,
        name: 'Morning Exercise',
        description: 'Daily workout routine',
        reminder: 'morning',
        frequency: 'daily',
        category: 'health',
        streakCount: 5,
        isActive: true
      };
      
      Habit.findById.mockResolvedValue(mockHabit);

      const response = await request(app)
        .get('/api/habits/' + testHabitId)
        .expect(200);
      
      console.log('Response status: ' + response.status);
      console.log('Habit name: ' + response.body.data.name);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data._id).toBe(testHabitId.toString());
      expect(response.body.data.name).toBe('Morning Exercise');
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.frequency).toBe('daily');
      expect(Habit.findById).toHaveBeenCalledWith(testHabitId.toString());
      
      console.log('TEST 4 PASSED');
    });

    test('TEST 5: Should return 404 when habit ID does not exist', async () => {
      console.log('\nTEST 5: Get Habit by Non-Existent ID');
      const nonExistentId = new mongoose.Types.ObjectId();
      console.log('URL: GET /api/habits/:id');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habits/' + nonExistentId);
      
      Habit.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/habits/' + nonExistentId)
        .expect(404);
      
      console.log('Response status: ' + response.status);
      console.log('Message: ' + response.body.message);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Habit not found');
      expect(Habit.findById).toHaveBeenCalledWith(nonExistentId.toString());
      
      console.log('TEST 5 PASSED');
    });

    test('TEST 6: Should return 500 when database error occurs', async () => {
      console.log('\nTEST 6: Get Habit with Database Error');
      const validId = new mongoose.Types.ObjectId();
      console.log('URL: GET /api/habits/:id');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habits/' + validId);
      
      Habit.findById.mockRejectedValue(new Error('Database query failed'));

      const response = await request(app)
        .get('/api/habits/' + validId)
        .expect(500);
      
      console.log('Response status: ' + response.status);
      console.log('Error message: ' + response.body.message);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(Habit.findById).toHaveBeenCalledWith(validId.toString());
      
      console.log('TEST 6 PASSED');
    });

    test('TEST 7: Should return 500 when invalid ObjectId format is provided', async () => {
      console.log('\nTEST 7: Get Habit with Invalid ID Format');
      const invalidId = 'invalid-id-format';
      console.log('URL: GET /api/habits/:id');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habits/' + invalidId);
      
      Habit.findById.mockRejectedValue(new Error('Cast to ObjectId failed'));

      const response = await request(app)
        .get('/api/habits/' + invalidId)
        .expect(500);
      
      console.log('Response status: ' + response.status);
      console.log('Error message: ' + response.body.message);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(Habit.findById).toHaveBeenCalledWith(invalidId);
      
      console.log('TEST 7 PASSED');
    });
  });

  afterAll(() => {
    console.log('\n==============================================');
    console.log('Habit GET API Test Suite Completed');
    console.log('==============================================');
  });
});
