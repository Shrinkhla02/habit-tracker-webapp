import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HabitModal from '../components/HabitModal';
import '../styles/buttons.css';
import '../styles/dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

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
      loadHabits(userObj.userId);
    } catch (e) {
      console.error('Error parsing user data:', e);
      navigate('/login');
    }
  }, [navigate]);

  const loadHabits = async (userId) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/habits/user/${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load habits');
      }
      
      const result = await response.json();
      if (result.success) {
        setHabits(result.data || []);
      } else {
        setError(result.message || 'Failed to load habits');
      }
    } catch (err) {
      console.error('Error loading habits:', err);
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setError('Cannot connect to server. Please make sure the backend server is running.');
      } else {
        setError('Failed to load habits. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHabitCreated = () => {
    if (user) {
      loadHabits(user.userId);
    }
    setShowModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const activeHabits = habits.filter(h => h.isActive).length;
  const totalHabits = habits.length;

  if (loading && !user) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <h1>
              <span className="welcome-emoji">🎯</span>
              Welcome back, {user?.name || 'User'}!
            </h1>
            <p>Track your habits and build better routines every day</p>
          </div>
          <div className="dashboard-actions">
            <Link to="/user-profile" className="action-btn btn-secondary-dash">
              👤 Profile
            </Link>
            <button onClick={handleLogout} className="action-btn btn-danger-dash">
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-alert">
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
            <button className="close-btn" onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Stats Section */}
        {!loading && totalHabits > 0 && (
          <div className="stats-section">
            <div className="stat-card">
              <span className="stat-icon">📊</span>
              <div className="stat-number">{totalHabits}</div>
              <div className="stat-label">Total Habits</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">✅</span>
              <div className="stat-number">{activeHabits}</div>
              <div className="stat-label">Active Habits</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⏸️</span>
              <div className="stat-number">{totalHabits - activeHabits}</div>
              <div className="stat-label">Paused Habits</div>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🔥</span>
              <div className="stat-number">0</div>
              <div className="stat-label">Current Streak</div>
            </div>
          </div>
        )}

        {/* Habits Section */}
        <div className="habits-section">
          <div className="section-title">
            <span>📋</span>
            <span>Your Habits</span>
            <button 
              className="action-btn btn-primary-dash"
              onClick={() => navigate('/add-habit')}
              style={{ marginLeft: 'auto', fontSize: '0.9rem', padding: '10px 20px' }}
            >
              ➕ Add New
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading habits...</p>
            </div>
          ) : habits.length === 0 ? (
            /* Empty State */
            <div className="empty-state">
              <span className="empty-icon">🎯</span>
              <h3>No habits yet</h3>
              <p>Start tracking your first habit today and build a better version of yourself!</p>
              <button 
                className="empty-btn"
                onClick={() => navigate('/add-habit')}
              >
                Create Your First Habit
              </button>
            </div>
          ) : (
            /* Habits Grid */
            <div className="habits-grid">
              {habits.map((habit) => (
                <div key={habit._id} className="habit-card">
                  <div className="habit-header">
                    <h3 className="habit-name">{habit.name}</h3>
                    <span className={`habit-badge ${habit.isActive ? 'badge-active' : 'badge-inactive'}`}>
                      {habit.isActive ? '✓ Active' : '⏸ Paused'}
                    </span>
                  </div>
                  
                  {habit.description && (
                    <p className="habit-description">{habit.description}</p>
                  )}
                  
                  <div className="habit-meta">
                    <div className="meta-item">
                      <span className="meta-icon">🏷️</span>
                      <span>{habit.category || 'Other'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">🔄</span>
                      <span>{habit.frequency || 'daily'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">🔔</span>
                      <span>{habit.reminder || 'morning'}</span>
                    </div>
                  </div>

                  <div className="habit-actions">
                    <Link 
                      to={`/edit-habit/${habit._id}`}
                      className="habit-btn btn-edit"
                    >
                      ✏️ Edit
                    </Link>
                    <button 
                      className="habit-btn btn-view"
                      onClick={() => alert('Habit logs feature coming soon!')}
                    >
                      📊 View Logs
                    </button>
                  </div>

                  <div className="habit-date">
                    Created on {formatDate(habit.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Habit Modal (fallback) */}
        <HabitModal 
          show={showModal} 
          onClose={() => setShowModal(false)}
          onSuccess={handleHabitCreated}
        />
      </div>
    </div>
  );
}

export default Dashboard;
