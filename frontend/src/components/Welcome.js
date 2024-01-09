// Welcome.js
import React from 'react';
import './Welcome.css';
import logo from '../images/Logo.png'; // Adjust the path as necessary

function Welcome() {
  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1>Welcome to</h1>
      </div>
      <img src={logo} alt="HealthEraAI Logo" className="logo" />
      <h3>Your personal AI-driven health and longevity companion.</h3>

      <div className="info-section">
        <h2>A New Era in Healthcare</h2>
        <p>
          HealthEraAI challenges the traditional "sickcare" system, addressing the root causes of health issues rather than just managing symptoms. Our mission is to empower individuals to take control of their health using AI-driven insights.
        </p>
      </div>

      <div className="info-section">
        <h2>Breaking Free from Misinformation</h2>
        <p>
          We have set out to challenge the misinformation in health guidelines influenced by external factors. HealthEraAI provides advice based on logic, research, and truth, helping you make informed decisions about your health and well-being.
        </p>
      </div>

      <div className="info-section">
        <h2>Personalized Health Conversations</h2>
        <p>
          Our AI chatbot offers in-depth discussions on health, longevity, fitness, and nutrition, tailored to your unique profile. Integration with wearables enhances this personalization, allowing for a holistic health approach.
        </p>
      </div>

      <div className="info-section">
        <h2>Transparency and Trust</h2>
        <p>
          Transparency is at our core. We openly share our knowledge base to ensure you understand the rationale behind our advice. Our service is available 24/7, providing health insights without the limitations of traditional healthcare models.
        </p>
      </div>

      <div className="info-section">
        <h2>Accessible Health Expertise</h2>
        <p>
          HealthEraAI brings expert health knowledge to your fingertips. Our subscription tiers cater to different needs, offering a range of features from basic access to comprehensive health management tools.
        </p>
      </div>

      <div className="buttons">
        <button className="signup-button">Sign Up</button>
        <button className="login-button">Login</button>
      </div>

    </div>
  );
}

export default Welcome;
