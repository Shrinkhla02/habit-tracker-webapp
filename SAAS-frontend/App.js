import React, { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5050/')  // Calls your backend
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(err => setMessage('Error connecting to backend'));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>React Frontend</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;
