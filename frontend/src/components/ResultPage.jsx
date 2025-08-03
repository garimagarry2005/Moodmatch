import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const ResultPage = () => {
  const query = new URLSearchParams(useLocation().search);
  const mood = query.get("mood")?.toLowerCase() || "default";
  const userId = localStorage.getItem("userId") || "anon";

  const [videos, setVideos] = useState({ sections: [], personal: [] });
  const [playlist, setPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [moodScore, setMoodScore] = useState(0); // Mood intensity support

  const fetchVideos = async (force = false) => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/youtube", {
        params: { mood, userId, forceRefresh: force, moodScore }
      });
      setVideos(res.data.videos);
      setPlaylist(res.data.playlist);
      setExpandedSections(new Set());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [mood, moodScore]);

  const sendFeedback = async (videoId, liked) => {
    try {
      await axios.post("http://localhost:5000/api/youtube/feedback", {
        userId,
        videoId,
        liked
      });
    } catch (err) {
      console.error("Feedback error", err);
    }
  };

  const sendHistory = async (videoId, section) => {
    try {
      await axios.post("http://localhost:5000/api/youtube/history", {
        userId,
        videoId,
        section
      });
    } catch (err) {
      console.error("History error", err);
    }
  };

  const toggleSection = (title) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  const renderSection = ({ title, items }) => {
    if (!items.length) return null;
    const expanded = expandedSections.has(title);
    const count = expanded ? items.length : Math.min(8, items.length);

    return (
      <div className="mt-4" key={title}>
        <h4 className="mb-3">{title}</h4>
        <div className="row">
          {items.slice(0, count).map((v, i) => (
            <div className="col-md-4 mb-4" key={i}>
              <div className="card shadow-sm h-100">
                <iframe
                  width="100%"
                  height="215"
                  src={`https://www.youtube.com/embed/${v.videoId}`}
                  title={v.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded"
                  onLoad={() => sendHistory(v.videoId, title)}
                />
                <div className="card-body">
                  <h6 className="card-title">{v.title}</h6>
                  <p className="text-muted small">{v.channel}</p>
                  {v.views != null && (
                    <p className="text-muted small">
                      👁️ {v.views.toLocaleString()} views
                    </p>
                  )}
                  <div>
                    <button
                      className="btn btn-sm btn-outline-success me-2"
                      onClick={() => sendFeedback(v.videoId, true)}
                    >
                      👍
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => sendFeedback(v.videoId, false)}
                    >
                      👎
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {items.length > count && (
          <div className="text-center mb-3">
            <button className="btn btn-link" onClick={() => toggleSection(title)}>
              {expanded ? "Show Less" : `See More (${items.length - count} more)`}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center">Your mood: {mood.toUpperCase()}</h2>
      <p className="text-center text-muted">
        Curated YouTube recommendations based on your mood, preferences, and time.
      </p>

      <div className="mb-3 text-center">
        <label className="form-label">How intense is your mood?</label>
        <select
          className="form-select w-auto d-inline mx-2"
          value={moodScore}
          onChange={(e) => setMoodScore(parseInt(e.target.value))}
        >
          <option value={0}>Mild</option>
          <option value={-1}>Moderate</option>
          <option value={-5}>Severe</option>
        </select>
        <button
          onClick={() => {
            setRefreshing(true);
            fetchVideos(true);
          }}
          className="btn btn-outline-primary ms-2"
          disabled={refreshing}
        >
          🔁 {refreshing ? "Refreshing..." : "Refresh Recommendations"}
        </button>
      </div>

      {loading ? (
        <p className="text-center">⏳ Loading videos...</p>
      ) : (
        <>
          {videos.sections.map(renderSection)}
          {videos.personal.length > 0 &&
            renderSection({ title: "⭐ For You", items: videos.personal })}

          {playlist.length > 0 && (
            <div className="mt-5">
              <h5>🔗 Playlist IDs:</h5>
              <pre style={{ whiteSpace: "pre-wrap" }}>{playlist.join(", ")}</pre>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResultPage;
