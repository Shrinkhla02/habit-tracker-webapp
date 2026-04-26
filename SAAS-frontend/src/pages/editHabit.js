import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const EditHabit = () => {
  const { habitId } = useParams();
  const navigate = useNavigate();

  const [habitName, setHabitName] = useState("Morning Meditation");
  const [description, setDescription] = useState("Medidate for 30 minutes");
  const [reminder, setReminder] = useState("Morning");
  const [frequency, setFrequency] = useState("Daily");
  const [category, setCategory] = useState("Fitness");
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!habitName.trim()) {
      newErrors.habitName = "Habit name is required.";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Simulate applying changes
      const updatedHabit = {
        id: habitId,
        habitName,
        description,
        reminder,
        frequency,
        category,
        isActive,
      };
      const existingHabits = JSON.parse(localStorage.getItem("habits")) || [];
      const updatedHabits = existingHabits.map(h =>
        h.id === habitId ? updatedHabit : h
      );
      localStorage.setItem("habits", JSON.stringify(updatedHabits));
      // Navigate back to dashboard after saving
      navigate("/dashboard");
    }
  };

  return (
    <main className="container py-4">
      <div className="col-12 col-lg-6 mx-auto">
        <div className="card shadow-sm">
          <div className="card-body">
            <h4 className="mb-3">Edit Habit</h4>
            <div className="text-muted small mb-3">Editing habit ID: {habitId}</div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Habit Name<span className="text-danger">*</span></label>
                <input
                  type="text"
                  className={`form-control${errors.habitName ? " is-invalid" : ""}`}
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                />
                {errors.habitName && <div className="invalid-feedback">{errors.habitName}</div>}
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Reminder</label>
                <select
                  className="form-select"
                  value={reminder}
                  onChange={(e) => setReminder(e.target.value)}
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Frequency</label>
                <select
                  className="form-select"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Fitness">Fitness</option>
                  <option value="Health">Health</option>
                  <option value="Learning">Learning</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="activeSwitch"
                  checked={isActive}
                  onChange={() => setIsActive(!isActive)}
                />
                <label className="form-check-label" htmlFor="activeSwitch">
                  Active
                </label>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light" onClick={() => navigate(-1)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-custom">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EditHabit;