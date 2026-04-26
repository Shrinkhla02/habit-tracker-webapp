import React from 'react';
import { useNavigate } from 'react-router-dom';

function Subscription() {
  const navigate = useNavigate();
  
  return (
    <div className="container py-5">
      <h1>Subscription</h1>
      <p>Manage your subscription plan here.</p>
      <button onClick={() => navigate('/')} className="btn btn-outline-secondary">Back to Home</button>
    </div>
  );
}

export default Subscription;

