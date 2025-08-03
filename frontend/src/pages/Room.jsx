import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Room = () => {
  const [roomDetails, setRoomDetails] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const res = await fetch('/api/mood-room');
        if (!res.ok) throw new Error('Failed to fetch room data');
        const data = await res.json();
        setRoomDetails(data.room);
        setMembers(data.members);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, []);

  if (isLoading) return <div className="container mt-5">Loading Mood Room...</div>;
  if (error) return <div className="container mt-5 text-danger">Error: {error}</div>;

  return (
    <div className="container mt-4">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h2>{roomDetails.name}</h2>
        <span className="badge bg-secondary">{roomDetails.mood}</span>
      </div>

      <div className="card p-4 shadow-sm mb-4">
        <h5>Platform: {roomDetails.platform}</h5>
        <p>Description: {roomDetails.description}</p>
        <Link to={`/watch/${roomDetails.id}`} className="btn btn-success">Start Watching Together</Link>
      </div>

      <div>
        <h4>Room Members</h4>
        <ul className="list-group">
          {members.map((member, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
              {member.username}
              <span className="badge bg-primary">{member.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Room;
