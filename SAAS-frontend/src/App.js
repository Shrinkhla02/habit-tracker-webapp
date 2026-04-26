import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/dashboard";
import EditHabit from "./pages/editHabit";
import UserProfile from './pages/userProfile';
import About from './pages/about';
import Login from './pages/login';
import Register from './pages/register';
import Subscription from './pages/subscription';
import HabitLogs from './pages/habitlogs';
import Reports from './pages/reports';
import Reminders from './pages/reminders';
import AddHabit from './pages/addHabit';
import './App.css';
import './styles/addHabit.css';

function Home() {
  const [message, setMessage] = useState('Loading backend...');
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Check if user is logged in (also check when location changes)
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        // Invalid user data
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    fetch('http://localhost:3001/api')
      .then((response) => response.json())
      .then((data) => setMessage(data.message || 'OK'))
      .catch((err) => setMessage(`Failed to reach backend: ${err?.message || 'Unknown error'}`));
  }, []);

  // Smooth-scroll to hero when navigating to /#top
  useEffect(() => {
    if (location.hash === '#top') {
      const el = document.getElementById('top');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.nav-user')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <div className="App">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <Link to="/#top" aria-label="BetterMe Home" className="nav-logo-link">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img 
                  src="/logo.png" 
                  alt="BetterMe Logo" 
                  className="nav-logo-img"
                  style={{
                    width: '48px',
                    height: '48px',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: '12px',
                    visibility: 'visible'
                  }}
                />
                <h2 className="nav-logo-text">BetterMe</h2>
              </div>
            </Link>
          </div>
          <div className="nav-menu">
            <a href="#features" className="nav-link">Features</a>
            <a href="#pricing" className="nav-link">Pricing</a>
            <Link to="/about" className="nav-link">About</Link>
            {user ? (
              <>
                <button className="nav-link nav-link-btn" onClick={() => navigate('/dashboard')}>Dashboard</button>
                <button className="nav-link nav-link-btn" onClick={() => navigate('/subscription')}>Subscription</button>
                <button className="nav-link nav-link-btn" onClick={() => navigate('/habitlogs')}>Habit Logs</button>
                <button className="nav-link nav-link-btn" onClick={() => navigate('/add-habit')}>Add Habits</button>
                <button className="nav-link nav-link-btn" onClick={() => navigate('/reports')}>Reports</button>
                <button className="nav-link nav-link-btn" onClick={() => navigate('/reminders')}>Reminders</button>
              </>
            ) : null}
          </div>
          {user ? (
            <div className="nav-user">
              <div className="nav-user-info" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="nav-user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="nav-user-name">{user.name}</span>
                <span className="nav-user-arrow">▼</span>
              </div>
              {showUserMenu && (
                <div className="nav-user-dropdown">
                  <div className="dropdown-item" onClick={() => { navigate('/dashboard'); setShowUserMenu(false); }}>
                    📊 Dashboard
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate('/subscription'); setShowUserMenu(false); }}>
                    💎 Subscription
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate('/habitlogs'); setShowUserMenu(false); }}>
                    📝 Habit Logs
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate('/add-habit'); setShowUserMenu(false); }}>
                    ➕ Add Habits
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate('/reports'); setShowUserMenu(false); }}>
                    📈 Reports
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate('/reminders'); setShowUserMenu(false); }}>
                    🔔 Reminders
                  </div>
                  <div className="dropdown-item" onClick={() => { navigate('/user-profile'); setShowUserMenu(false); }}>
                    👤 Profile
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-item logout" onClick={() => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('user');
                    setUser(null);
                    setShowUserMenu(false);
                    navigate('/');
                  }}>
                    🚪 Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-btn" onClick={() => navigate('/login')}>Get Started</button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="top" className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-logo-container">
              <img 
                src="/logo.png" 
                alt="BetterMe Logo" 
                className="hero-logo"
              />
            </div>
            <h1 className="hero-title">
              Build Better Habits with 
              <span className="gradient-text"> Smart Tracking</span>
            </h1>
            <p className="hero-description">
              Track, monitor, and achieve your goals with our powerful habit tracking platform. 
              Join thousands of users building better habits every day.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn-primary" 
                onClick={() => navigate(user ? '/dashboard' : '/register')}
              >
                Start Tracking Habits
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  const featuresSection = document.getElementById('features');
                  if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                See How It Works
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <h3>50K+</h3>
                <p>Habits Tracked</p>
              </div>
              <div className="stat">
                <h3>85%</h3>
                <p>Success Rate</p>
              </div>
              <div className="stat">
                <h3>30 Days</h3>
                <p>Free Trial</p>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <div className="card-icon">📈</div>
              <h4>Progress</h4>
              <p>Track your streaks</p>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">🎯</div>
              <h4>Goals</h4>
              <p>Set & achieve</p>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">📱</div>
              <h4>Mobile</h4>
              <p>Track anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">Why Choose BetterMe?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Visual Progress</h3>
              <p>See your habit streaks and progress with beautiful charts and graphs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Smart Reminders</h3>
              <p>Get personalized notifications to keep you on track with your habits.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Goal Setting</h3>
              <p>Set specific, measurable goals and track your journey to success.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Mobile App</h3>
              <p>Track habits on the go with our intuitive mobile application.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Community</h3>
              <p>Connect with others, share progress, and stay motivated together.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Achievements</h3>
              <p>Earn badges and rewards as you build consistent habits over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <h2 className="section-title">Choose Your Plan</h2>
          <p className="pricing-subtitle">Start with 3 free habits, upgrade anytime for unlimited tracking</p>
          <div className="pricing-grid">
            {/* Free Plan */}
            <div className="pricing-card free">
              <div className="pricing-header">
                <h3>Free</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">0</span>
                  <span className="period">/month</span>
                </div>
                <p className="plan-description">Perfect for getting started</p>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Track up to 3 habits</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Basic progress tracking</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Mobile app access</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>7-day streak history</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Basic reminders</span>
                </div>
                <div className="feature-item disabled">
                  <span className="cross">✗</span>
                  <span>Advanced analytics</span>
                </div>
                <div className="feature-item disabled">
                  <span className="cross">✗</span>
                  <span>Community features</span>
                </div>
                <div className="feature-item disabled">
                  <span className="cross">✗</span>
                  <span>Custom themes</span>
                </div>
              </div>
              <button 
                className="pricing-btn free-btn"
                onClick={() => navigate(user ? '/dashboard' : '/register')}
              >
                Get Started Free
              </button>
            </div>

            {/* Premium Plan */}
            <div className="pricing-card premium popular">
              <div className="popular-badge">Most Popular</div>
              <div className="pricing-header">
                <h3>Premium</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">9.99</span>
                  <span className="period">/month</span>
                </div>
                <p className="plan-description">For serious habit builders</p>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Unlimited habits</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Advanced progress tracking</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Mobile app access</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Unlimited streak history</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Smart reminders</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Advanced analytics & insights</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Community features</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Custom themes & personalization</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Data export</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Priority support</span>
                </div>
              </div>
              <button 
                className="pricing-btn premium-btn"
                onClick={() => navigate(user ? '/dashboard' : '/register')}
              >
                Start Premium Trial
              </button>
            </div>

            {/* Pro Plan */}
            <div className="pricing-card pro">
              <div className="pricing-header">
                <h3>Pro</h3>
                <div className="price">
                  <span className="currency">$</span>
                  <span className="amount">19.99</span>
                  <span className="period">/month</span>
                </div>
                <p className="plan-description">For teams and power users</p>
              </div>
              <div className="pricing-features">
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Everything in Premium</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Team collaboration</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Family sharing (up to 6 users)</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Advanced goal setting</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Habit coaching AI</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>Custom integrations</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>White-label options</span>
                </div>
                <div className="feature-item">
                  <span className="check">✓</span>
                  <span>24/7 priority support</span>
                </div>
              </div>
              <button 
                className="pricing-btn pro-btn"
                onClick={() => navigate(user ? '/dashboard' : '/register')}
              >
                Go Pro
              </button>
            </div>
          </div>
          
          <div className="pricing-footer">
            <p>All plans include a 30-day free trial. Cancel anytime.</p>
            <div className="pricing-guarantee">
              <span className="guarantee-icon">🛡️</span>
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Build Better Habits?</h2>
            <p>Join thousands of users who are already transforming their lives with better habits.</p>
            <div className="cta-buttons">
              <button 
                className="btn-primary large"
                onClick={() => navigate(user ? '/dashboard' : '/register')}
              >
                Start Your Free Trial
              </button>
              <button 
                className="btn-outline large"
                onClick={() => navigate('/about')}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo-container">
                <img 
                  src="/logo.png" 
                  alt="BetterMe Logo" 
                  className="footer-logo"
                />
                <h3>BetterMe</h3>
              </div>
              <p>Empowering people to build better habits and achieve their goals.</p>
            </div>
            <div className="footer-section">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#mobile">Mobile App</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#help">Help Center</a></li>
                <li><a href="#guides">Habit Guides</a></li>
                <li><a href="#community">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 BetterMe. All rights reserved.</p>
            <div className="footer-links">
              <a href="#privacy">Privacy</a>
              <a href="#terms">Terms</a>
              <a href="#cookies">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Backend Status (Hidden) */}
      <div style={{ display: 'none' }}>
        <p>{message}</p>
      </div>
    </div>
  );
}

// App = router that switches between pages
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit-habit/:habitId" element={<EditHabit />} />
        <Route path="/user-profile" element={<UserProfile/>} />
        <Route path="/about" element={<About />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/habitlogs" element={<HabitLogs />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/add-habit" element={<AddHabit />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
