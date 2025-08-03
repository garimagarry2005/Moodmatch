import React from 'react';

const MoodCard = ({ title, type, mood, platform }) => {
  return (
    <div className="card shadow-sm mb-3">
      <div className="card-body">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">
          Type: {type} <br />
          Mood: {mood} <br />
          Platform: {platform}
        </p>
        <button className="btn btn-outline-primary">Watch Now</button>
      </div>
    </div>
  );
};

export default MoodCard;
