import React from 'react';
import { useNavigate } from 'react-router-dom';

function Reminders() {
  const navigate = useNavigate();
  
  return (
    <div className="container py-5">
      <h1>Reminders</h1>
      <p>Manage your habit reminders here.</p>
      <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Go to Dashboard</button>
      <button onClick={() => navigate('/')} className="btn btn-outline-secondary ms-2">Back to Home</button>
    </div>
  );
}

export default Reminders;

