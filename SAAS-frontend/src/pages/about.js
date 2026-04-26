import React from 'react';

function About() {
  return (
    <div className="about">
      <section className="about-hero">
        <div className="container">
          <h1 className="section-title">About BetterMe</h1>
          <p className="about-subtitle">We help you build consistent habits with clarity, motivation, and delightful design.</p>
        </div>
      </section>

      <section className="about-section">
        <div className="container about-grid">
          <div className="about-card">
            <h3>Our Mission</h3>
            <p>Empower millions to achieve meaningful change through small daily actions. BetterMe blends behavioral science with a simple, friendly experience so you can stick with what matters.</p>
          </div>
          <div className="about-card">
            <h3>How It Works</h3>
            <ul className="about-list">
              <li>Define your habits and cadence</li>
              <li>Track progress with streaks and insights</li>
              <li>Get smart reminders when it counts</li>
              <li>Celebrate wins and adjust with data</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <h2 className="about-heading">What makes us different</h2>
          <div className="about-grid three">
            <div className="about-card">
              <h4>Delightful UX</h4>
              <p>Fast, clean, and inspiring design that makes tracking feel effortless.</p>
            </div>
            <div className="about-card">
              <h4>Actionable Insights</h4>
              <p>Understand trends, spot blockers, and get guidance to stay on track.</p>
            </div>
            <div className="about-card">
              <h4>Privacy First</h4>
              <p>Your data is yours. We prioritize transparency and secure handling.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-cta">
        <div className="container">
          <h2>Ready to build better habits?</h2>
          <p>Start tracking for free and see progress in days, not months.</p>
          <a href="/#top" className="btn-primary">Get Started</a>
        </div>
      </section>
    </div>
  );
}

export default About;


