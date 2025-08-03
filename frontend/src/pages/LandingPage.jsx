import React from 'react';
import { Link } from 'react-router-dom';
//import './Landing.css'; // optional for styling

const LandingPage = () => {
  return (
    <div className="landing-container d-flex flex-column justify-content-center align-items-center text-center vh-100 bg-light">
      <h1 className="display-4 mb-3">Welcome to <span className="text-primary">MoodMatch</span></h1>
      <p className="lead mb-4">Discover content that matches your mood 🎭</p>
      
      <div className="d-flex gap-3">
        <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
        <Link to="/register" className="btn btn-outline-primary btn-lg">Register</Link>
      </div>
    </div>
  );
};

export default LandingPage;
