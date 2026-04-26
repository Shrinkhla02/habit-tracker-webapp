const HabitLog = require('../models/HabitLog');
const Habit = require('../models/Habit');
const mongoose = require('mongoose');

exports.getAll = async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    
    // If userId is provided, filter by userId
    // Handle both string and ObjectId formats
    if (userId) {
      // Try to convert to ObjectId if it's a valid ObjectId string
      if (mongoose.Types.ObjectId.isValid(userId)) {
        query.userId = new mongoose.Types.ObjectId(userId);
      } else {
        query.userId = userId;
      }
    }
    
    const logs = await HabitLog.find(query).sort({ completedDate: -1 });
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all habit logs',
      error: error.message
    });
  }
};

exports.getHabitLogs = async (req, res) => {
  try {
    const habitId = req.params.habitId;
    const logs = await HabitLog.find({ habitId: habitId }).sort({ completedDate: -1 });
    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching habit logs',
      error: error.message
    });
  }
};

exports.getHabitLogById = async (req, res) => {
  try {
    const logId = req.params.id;
    const log = await HabitLog.findById(logId);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Habit log not found'
      });
    }
    res.status(200).json({
      success: true,
      data: log
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching habit log',
      error: error.message
    });
  }
};

exports.createHabitLog = async (req, res) => {
  try {
    const { habitId, userId, completedDate, isCompleted, duration, difficulty, mood, energyLevel, notes } = req.body;
    if (!habitId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'habitId and userId are required'
      });
    }
    
    // Create the habit log
    const newLog = new HabitLog({
      habitId,
      userId,
      completedDate: completedDate || new Date(),
      isCompleted: isCompleted !== undefined ? isCompleted : true,
      duration: duration || 0,
      difficulty: difficulty || null,
      mood: mood || null,
      energyLevel: energyLevel || null,
      notes: notes || null
    });
    
    const savedLog = await newLog.save();
    
    // Update the habit's streak and last completed date
    if (isCompleted !== false) {
      try {
        const habit = await Habit.findById(habitId);
        if (habit) {
          // Calculate streak
          const logDate = new Date(completedDate || new Date());
          const lastCompleted = habit.lastCompletedDate ? new Date(habit.lastCompletedDate) : null;
          
          let currentStreak = habit.currentStreak || 0;
          
          if (lastCompleted) {
            // Check if this is consecutive (within 1-2 days)
            const daysDiff = Math.floor((logDate - lastCompleted) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
              // Consecutive day
              currentStreak += 1;
            } else if (daysDiff === 0) {
              // Same day, don't increment
              currentStreak = currentStreak;
            } else {
              // Streak broken, reset to 1
              currentStreak = 1;
            }
          } else {
            // First completion
            currentStreak = 1;
          }
          
          // Update habit
          habit.currentStreak = currentStreak;
          habit.bestStreak = Math.max(habit.bestStreak || 0, currentStreak);
          habit.lastCompletedDate = logDate;
          await habit.save();
        }
      } catch (habitError) {
        console.error('Error updating habit streak:', habitError);
        // Don't fail the request if habit update fails
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Habit log created successfully',
      data: savedLog
    });
  } catch (error) {
    // Handle duplicate key error (same habit completed on same date)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This habit has already been completed for this date'
      });
    }
    res.status(400).json({
      success: false,
      message: 'Error creating habit log',
      error: error.message
    });
  }
};

exports.updateHabitLog = async (req, res) => {
  try {
    const logId = req.params.id;
    const updateData = req.body;
    const updatedLog = await HabitLog.findByIdAndUpdate(
      logId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedLog) {
      return res.status(404).json({
        success: false,
        message: 'Habit log not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Habit log updated successfully',
      data: updatedLog
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating habit log',
      error: error.message
    });
  }
};

exports.deleteHabitLog = async (req, res) => {
  try {
    const logId = req.params.id;
    const deletedLog = await HabitLog.findByIdAndDelete(logId);
    if (!deletedLog) {
      return res.status(404).json({
        success: false,
        message: 'Habit log not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Habit log deleted successfully',
      data: deletedLog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting habit log',
      error: error.message
    });
  }
};