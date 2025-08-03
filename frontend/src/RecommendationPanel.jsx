import React from 'react';

export default function RecommendationPanel({ section }) {
  if (!section.items.length) return null;
  return (
    <div className="section">
      <h2>{section.title}</h2>
      <div className="grid">
        {section.items.map(v => (
          <div key={v.videoId} className="card">
            <iframe
              src={`https://www.youtube.com/embed/${v.videoId}`}
              title={v.title}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
            <div className="info">
              <h4>{v.title}</h4>
              <p>{v.channelTitle}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
