import React from 'react';
import { useNavigate } from 'react-router-dom';

function Reports() {
  const navigate = useNavigate();
  
  return (
    <div className="container py-5">
      <h1>Reports</h1>
      <p>View your habit tracking reports and analytics here.</p>
      <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Go to Dashboard</button>
      <button onClick={() => navigate('/')} className="btn btn-outline-secondary ms-2">Back to Home</button>
    </div>
  );
}

export default Reports;

