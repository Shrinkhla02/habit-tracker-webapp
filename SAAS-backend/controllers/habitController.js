const Habit = require('../models/Habit');
const User = require('../model/user');
const Subscription = require('../model/subscription');

exports.getAll = async (req, res) => {
  try {
    const habits = await Habit.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: habits.length,
      data: habits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all habits',
      error: error.message
    });
  }
};

exports.getAllHabits = async (req, res) => {
  try {
    const userId = req.params.userId;
    const habits = await Habit.find({ userId: userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: habits.length,
      data: habits
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching habits',
      error: error.message
    });
  }
};

exports.getHabitById = async (req, res) => {
  try {
    const habitId = req.params.id;
    const habit = await Habit.findById(habitId);
    if (!habit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }
    res.status(200).json({
      success: true,
      data: habit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching habit',
      error: error.message
    });
  }
};

exports.createHabit = async (req, res) => {
  try {
    const { 
      userId, 
      name, 
      description, 
      reminder, 
      frequency, 
      category, 
      notes,
      reminderFrequency,
      reminderTime,
      reminderDate,
      daysOfWeek,
      dayOfMonth,
      isActive
    } = req.body;
    
    if (!userId || !name) {
      return res.status(400).json({
        success: false,
        message: 'userId and name are required'
      });
    }

    // Check user's subscription plan and habit limit
    const user = await User.findOne({ userId: userId });
    let habitLimit = 3; // default for basic plan
    
    if (user) {
      // Check if user has isPro flag
      if (user.isPro) {
        habitLimit = -1; // unlimited
      } else {
        // Check for active subscription
        const subscription = await Subscription.findOne({ 
          userId: userId, 
          isActive: true 
        });
        
        if (subscription) {
          switch (subscription.planType) {
            case 'basic':
              habitLimit = 3;
              break;
            case 'premium':
              habitLimit = 10;
              break;
            case 'pro':
              habitLimit = -1; // unlimited
              break;
            default:
              habitLimit = 3;
          }
        }
      }
    }

    // Check current habit count if there's a limit
    if (habitLimit > 0) {
      const currentHabitCount = await Habit.countDocuments({ userId: userId, isActive: true });
      if (currentHabitCount >= habitLimit) {
        return res.status(403).json({
          success: false,
          message: `Habit limit reached. You can only have ${habitLimit} habit${habitLimit > 1 ? 's' : ''} on your current plan. Upgrade to create more habits!`
        });
      }
    }
    
    const newHabit = new Habit({
      userId,
      name,
      description,
      reminder,
      frequency,
      category,
      notes,
      reminderFrequency,
      reminderTime,
      reminderDate,
      daysOfWeek,
      dayOfMonth,
      isActive
    });
    
    const savedHabit = await newHabit.save();
    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      data: savedHabit
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating habit',
      error: error.message
    });
  }
};

exports.updateHabit = async (req, res) => {
  try {
    const habitId = req.params.id;
    const updateData = req.body;
    const updatedHabit = await Habit.findByIdAndUpdate(
      habitId,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedHabit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Habit updated successfully',
      data: updatedHabit
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating habit',
      error: error.message
    });
  }
};

exports.deleteHabit = async (req, res) => {
  try {
    const habitId = req.params.id;
    const deletedHabit = await Habit.findByIdAndDelete(habitId);
    if (!deletedHabit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }
    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully',
      data: deletedHabit
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting habit',
      error: error.message
    });
  }
};

exports.updateHabitReminderTime = async (req, res) => {
  try {
    const habitId = req.params.id;
    const { date, time } = req.body;
    
    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required'
      });
    }

    const updatedHabit = await Habit.findByIdAndUpdate(
      habitId,
      { 
        reminderDate: date,
        reminderTime: time
      },
      { new: true, runValidators: true }
    );

    if (!updatedHabit) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Reminder time updated successfully',
      data: updatedHabit
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating reminder time',
      error: error.message
    });
  }
};