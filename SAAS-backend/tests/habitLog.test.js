const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const HabitLog = require('../models/HabitLog');
const habitLogController = require('../controllers/habitLogController');

jest.mock('../models/HabitLog');

const app = express();
app.use(express.json());
app.get('/api/habitLogs', habitLogController.getAll);
app.get('/api/habitLogs/:id', habitLogController.getHabitLogById);

describe('HabitLog API Unit Tests', () => {
  let testHabitLogId;
  let testHabitId;
  let testUserId;

  beforeAll(() => {
    testHabitLogId = new mongoose.Types.ObjectId();
    testHabitId = new mongoose.Types.ObjectId();
    testUserId = new mongoose.Types.ObjectId();
    console.log('\n==============================================');
    console.log('HabitLog API Test Suite Starting');
    console.log('==============================================');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SINGLE OBJECT TEST - GET /api/habitLogs/:id', () => {
    
    test('TEST 1: Should return single habit log when valid ID is provided', async () => {
      console.log('\nTEST 1: Get Habit Log by Valid ID');
      console.log('URL: GET /api/habitLogs/:id');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habitLogs/' + testHabitLogId);
      
      const mockHabitLog = {
        _id: testHabitLogId,
        habitId: testHabitId,
        userId: testUserId,
        completedDate: new Date('2025-11-10'),
        isCompleted: true,
        duration: 30,
        difficulty: 'medium',
        mood: 'happy',
        energyLevel: 8,
        notes: 'Great session!'
      };
      
      HabitLog.findById.mockResolvedValue(mockHabitLog);

      const response = await request(app)
        .get('/api/habitLogs/' + testHabitLogId)
        .expect(200);
      
      console.log('Response status: ' + response.status);
      console.log('Success: ' + response.body.success);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data._id).toBe(testHabitLogId.toString());
      expect(response.body.data.isCompleted).toBe(true);
      expect(response.body.data.duration).toBe(30);
      expect(HabitLog.findById).toHaveBeenCalledWith(testHabitLogId.toString());
      
      console.log('TEST 1 PASSED');
    });

    test('TEST 2: Should return 404 when habit log ID does not exist', async () => {
      console.log('\nTEST 2: Get Habit Log by Non-Existent ID');
      const nonExistentId = new mongoose.Types.ObjectId();
      console.log('URL: GET /api/habitLogs/:id');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habitLogs/' + nonExistentId);
      
      HabitLog.findById.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/habitLogs/' + nonExistentId)
        .expect(404);
      
      console.log('Response status: ' + response.status);
      console.log('Message: ' + response.body.message);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Habit log not found');
      expect(HabitLog.findById).toHaveBeenCalledWith(nonExistentId.toString());
      
      console.log('TEST 2 PASSED');
    });

    test('TEST 3: Should return 500 when database error occurs', async () => {
      console.log('\nTEST 3: Get Habit Log with Database Error');
      const validId = new mongoose.Types.ObjectId();
      console.log('URL: GET /api/habitLogs/:id');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habitLogs/' + validId);
      
      const dbError = new Error('Database connection failed');
      HabitLog.findById.mockRejectedValue(dbError);

      const response = await request(app)
        .get('/api/habitLogs/' + validId)
        .expect(500);
      
      console.log('Response status: ' + response.status);
      console.log('Error: ' + response.body.error);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message', 'Error fetching habit log');
      expect(response.body).toHaveProperty('error', dbError.message);
      
      console.log('TEST 3 PASSED');
    });
  });

  describe('LIST OBJECT TEST - GET /api/habitLogs', () => {
    
    test('TEST 4: Should return all habit logs with correct count', async () => {
      console.log('\nTEST 4: Get All Habit Logs (Multiple Records)');
      console.log('URL: GET /api/habitLogs');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habitLogs');
      
      const mockLogs = [
        {
          _id: new mongoose.Types.ObjectId(),
          habitId: testHabitId,
          userId: testUserId,
          completedDate: new Date('2025-11-10'),
          isCompleted: true,
          duration: 30,
          difficulty: 'easy',
          mood: 'happy',
          energyLevel: 9
        },
        {
          _id: new mongoose.Types.ObjectId(),
          habitId: testHabitId,
          userId: testUserId,
          completedDate: new Date('2025-11-09'),
          isCompleted: true,
          duration: 45,
          difficulty: 'medium',
          mood: 'neutral',
          energyLevel: 7
        },
        {
          _id: new mongoose.Types.ObjectId(),
          habitId: new mongoose.Types.ObjectId(),
          userId: testUserId,
          completedDate: new Date('2025-11-08'),
          isCompleted: false,
          duration: 0,
          difficulty: null,
          mood: 'tired',
          energyLevel: 5
        }
      ];

      const mockSort = jest.fn().mockResolvedValue(mockLogs);
      HabitLog.find.mockReturnValue({ sort: mockSort });

      const response = await request(app)
        .get('/api/habitLogs')
        .expect(200);
      
      console.log('Response status: ' + response.status);
      console.log('Count: ' + response.body.count);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 3);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(HabitLog.find).toHaveBeenCalledWith({});
      expect(mockSort).toHaveBeenCalledWith({ completedDate: -1 });
      
      console.log('TEST 4 PASSED');
    });

    test('TEST 5: Should return empty array when no habit logs exist', async () => {
      console.log('\nTEST 5: Get All Habit Logs (Empty Database)');
      console.log('URL: GET /api/habitLogs');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habitLogs');
      
      const mockSort = jest.fn().mockResolvedValue([]);
      HabitLog.find.mockReturnValue({ sort: mockSort });

      const response = await request(app)
        .get('/api/habitLogs')
        .expect(200);
      
      console.log('Response status: ' + response.status);
      console.log('Count: ' + response.body.count);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(0);
      
      console.log('TEST 5 PASSED');
    });

    test('TEST 6: Should return habit logs with all required fields', async () => {
      console.log('\nTEST 6: Verify All Required Fields in Response');
      console.log('URL: GET /api/habitLogs');
      console.log('Host: http://localhost (supertest)');
      console.log('Path: /api/habitLogs');
      
      const mockLog = {
        _id: new mongoose.Types.ObjectId(),
        habitId: testHabitId,
        userId: testUserId,
        completedDate: new Date('2025-11-10'),
        isCompleted: true,
        duration: 30,
        difficulty: 'hard',
        mood: 'motivated',
        energyLevel: 8,
        notes: 'Pushed through difficulties'
      };

      const mockSort = jest.fn().mockResolvedValue([mockLog]);
      HabitLog.find.mockReturnValue({ sort: mockSort });

      const response = await request(app)
        .get('/api/habitLogs')
        .expect(200);
      
      console.log('Response status: ' + response.status);

      const log = response.body.data[0];
      const requiredFields = [
        '_id', 'habitId', 'userId', 'completedDate', 
        'isCompleted', 'duration', 'difficulty', 'mood', 
        'energyLevel', 'notes'
      ];
      
      requiredFields.forEach(field => {
        expect(log).toHaveProperty(field);
      });
      
      console.log('All fields verified');
      console.log('TEST 6 PASSED');
    });
  });

  afterAll(() => {
    console.log('\n==============================================');
    console.log('Test Suite Completed');
    console.log('==============================================');
  });
});