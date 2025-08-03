// File: src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand fw-bold" to="/">
        MoodMatch
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link className="nav-link" to="/moodDetect">Detect Mood</Link>
          </li>
          
          <li className="nav-item">
            <Link className="nav-link" to="/recommendations">Recommendations</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/rooms">Mood Rooms</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/history">Mood History</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link btn btn-outline-light ms-3" to="/login">Logout</Link>
          </li>
          <li><Link to="/mood-history">Mood History</Link></li>

        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
