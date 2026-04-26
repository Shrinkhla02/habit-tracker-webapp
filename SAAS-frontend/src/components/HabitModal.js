import React, { useState, useEffect } from "react";

// Controlled modal: parent passes `show` and `onClose`
const HabitModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    description: "",
    reminder: "morning",
    frequency: "daily",
    category: "health",
    isActive: true,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get user ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setFormData(prev => ({ ...prev, userId: user.userId }));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Please enter a habit name.");
      return;
    }

    if (!formData.userId) {
      setError("User not found. Please login again.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/habits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: formData.userId,
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

      // Reset form
      setFormData({
        userId: formData.userId,
        name: "",
        description: "",
        reminder: "morning",
        frequency: "daily",
        category: "health",
        isActive: true,
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        onClose?.();
      }
    } catch (err) {
      console.error('Error creating habit:', err);
      setError(err.message || 'Failed to create habit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", zIndex: 1050 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-3 shadow-lg p-4" style={{ width: "100%", maxWidth: "500px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Add New Habit</h5>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Habit Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              placeholder="e.g. Morning Run"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="description" className="form-label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control"
              placeholder="Run for 30 minutes"
              rows="2"
            />
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor="reminder" className="form-label">Reminder</label>
              <select
                id="reminder"
                name="reminder"
                value={formData.reminder}
                onChange={handleChange}
                className="form-select"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div className="col-md-6">
              <label htmlFor="frequency" className="form-label">Frequency</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="form-select"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="mb-3 mt-3">
            <label htmlFor="category" className="form-label">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
            >
              <option value="fitness">Fitness</option>
              <option value="health">Health</option>
              <option value="learning">Learning</option>
              <option value="productivity">Productivity</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-check form-switch mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="isActive">Active</label>
          </div>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              className="btn btn-light" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-custom"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Add Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HabitModal;