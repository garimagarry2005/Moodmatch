import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MoodHistory.css'; // create this for styling

const MoodHistory = ({ userId }) => {
  const [moods, setMoods] = useState([]);

  useEffect(() => {
    if (!userId) return;
    axios.get(`/api/mood-history/${userId}`).then(res => setMoods(res.data));
  }, [userId]);

  return (
    <div className="mood-history-page">
      <h2>Your Mood Journey</h2>
      {moods.length === 0 ? (
        <p>No mood history yet.</p>
      ) : (
        <ul className="mood-list">
          {moods.map((entry, i) => (
            <li key={i} className="mood-card">
              <strong>{entry.mood}</strong> at {new Date(entry.detectedAt).toLocaleString()}<br />
              Score: {entry.moodScore} | Section: {entry.context?.section || 'N/A'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MoodHistory;
