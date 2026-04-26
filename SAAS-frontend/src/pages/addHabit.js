import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/buttons.css';

function AddHabit() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reminder: 'morning',
    frequency: 'daily',
    category: 'health',
    isActive: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('authToken');
    
    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      setUser(userObj);
    } catch (e) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter a habit name.');
      return;
    }

    if (!user) {
      setError('User not found. Please login again.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId,
          name: formData.name.trim(),
          description: formData.description.trim(),
          reminder: formData.reminder,
          frequency: formData.frequency,
          category: formData.category,
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create habit');
      }

      setSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        reminder: 'morning',
        frequency: 'daily',
        category: 'health',
        isActive: true,
      });

      // Redirect after 1.5 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      console.error('Error creating habit:', err);
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Cannot connect to server. Please make sure the backend server is running.');
      } else {
        setError(err.message || 'Failed to create habit. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container py-5 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="add-habit-page">
      <div className="add-habit-container">
        <div className="add-habit-card">
          {/* Header */}
          <div className="add-habit-header">
            <button 
              className="back-btn" 
              onClick={() => navigate('/dashboard')}
              aria-label="Go back"
            >
              ← Back
            </button>
            <div className="header-content">
              <div className="header-icon">✨</div>
              <h1>Create New Habit</h1>
              <p>Start building a better version of yourself, one habit at a time</p>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="success-message">
              <span className="success-icon">✓</span>
              <span>Habit created successfully! Redirecting to dashboard...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="habit-form">
            {/* Habit Name */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🎯</span>
                Habit Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Morning Meditation, Daily Exercise..."
                required
                autoFocus
              />
              <small className="form-hint">Give your habit a clear, motivating name</small>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">📝</span>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-textarea"
                placeholder="Describe what this habit means to you..."
                rows="4"
              />
              <small className="form-hint">Add details about your habit goal</small>
            </div>

            {/* Category and Frequency Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🏷️</span>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="health">🏥 Health</option>
                  <option value="fitness">💪 Fitness</option>
                  <option value="learning">📚 Learning</option>
                  <option value="productivity">⚡ Productivity</option>
                  <option value="other">✨ Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="label-icon">🔄</span>
                  Frequency
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="daily">📅 Daily</option>
                  <option value="weekly">📆 Weekly</option>
                </select>
              </div>
            </div>

            {/* Reminder Time */}
            <div className="form-group">
              <label className="form-label">
                <span className="label-icon">🔔</span>
                Reminder Time
              </label>
              <div className="reminder-options">
                <label className={`reminder-option ${formData.reminder === 'morning' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="reminder"
                    value="morning"
                    checked={formData.reminder === 'morning'}
                    onChange={handleChange}
                  />
                  <span className="option-icon">🌅</span>
                  <span>Morning</span>
                </label>
                <label className={`reminder-option ${formData.reminder === 'afternoon' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="reminder"
                    value="afternoon"
                    checked={formData.reminder === 'afternoon'}
                    onChange={handleChange}
                  />
                  <span className="option-icon">☀️</span>
                  <span>Afternoon</span>
                </label>
                <label className={`reminder-option ${formData.reminder === 'evening' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="reminder"
                    value="evening"
                    checked={formData.reminder === 'evening'}
                    onChange={handleChange}
                  />
                  <span className="option-icon">🌙</span>
                  <span>Evening</span>
                </label>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="form-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="toggle-input"
                />
                <span className="toggle-slider"></span>
                <span className="toggle-text">
                  <span className="toggle-icon">{formData.isActive ? '✅' : '⏸️'}</span>
                  {formData.isActive ? 'Active' : 'Paused'}
                </span>
              </label>
              <small className="form-hint">Active habits will show up on your dashboard</small>
            </div>

            {/* Submit Button */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading || success}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Creating...
                  </>
                ) : success ? (
                  <>
                    <span>✓</span>
                    Created!
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Create Habit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddHabit;

