import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import MoodCard from "../components/MoodCard";
import ContinueWatching from "../components/ContinueWatching";
import axios from "axios";

const Home = () => {
  const [user, setUser] = useState(null);
  const [mood, setMood] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [moodRoom, setMoodRoom] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get("/api/user/profile");
        setUser(userRes.data);

        const moodRes = await axios.get("/api/user/mood");
        setMood(moodRes.data.mood);

        const recRes = await axios.get("/api/user/recommendations");
        setRecommendations(recRes.data);

        const historyRes = await axios.get("/api/user/history");
        setWatchHistory(historyRes.data);

        const roomRes = await axios.get("/api/user/mood-room");
        setMoodRoom(roomRes.data);
      } catch (error) {
        console.error("Error fetching home data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">
            {user ? `Hi ${user.name} 👋` : "Welcome to MoodMatch!"}
          </h2>
          {mood && (
            <span className="badge bg-info text-dark fs-6 mt-2">
              Current Mood: {mood} &nbsp;
              <Link to="/detect-mood" className="text-dark text-decoration-underline">Update</Link>
            </span>
          )}
        </div>
        <img
          src={user?.profilePicture || "/profile.png"}
          alt="Profile"
          className="rounded-circle"
          width="60"
          height="60"
        />
      </div>

      {/* Continue Watching */}
      <div className="mb-5">
        <h4 className="mb-3">▶️ Continue Watching</h4>
        {watchHistory.length > 0 ? (
          <ContinueWatching history={watchHistory} />
        ) : (
          <p className="text-muted">No watch history yet.</p>
        )}
      </div>

      {/* Mood-Based Recommendations */}
      <div className="mb-5">
        {recommendations.length > 0 && (
          <>
            <h4 className="mb-4">🎯 Because you're feeling <strong>{mood}</strong></h4>
            <div className="row g-4">
              {recommendations.map((item, idx) => (
                <div className="col-sm-6 col-md-4 col-lg-3" key={idx}>
                  <MoodCard
                    title={item.title}
                    type={item.type}
                    mood={item.mood}
                    platform={item.platform}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Mood Room */}
      {moodRoom && (
        <div className="mb-5">
          <h4 className="mb-3">🧑‍🤝‍🧑 Mood Room</h4>
          <div className="card border-0 shadow-sm p-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold">{moodRoom.name}</h5>
                <p className="text-muted mb-1">Platform: {moodRoom.platform}</p>
              </div>
              <Link to="/mood-room" className="btn btn-success">
                Join Room
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
