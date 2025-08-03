import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MoodInput from "./components/MoodInput";
import Room from "./pages/Room";
import LandingPage from "./pages/LandingPage";
import ResultPage from "./components/ResultPage";
import MoodHistory from "./pages/MoodHistory";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/moodDetect" element={<MoodInput />} />
        <Route path="/rooms" element={<Room />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/mood-history" element={<MoodHistory userId={localStorage.getItem("userId")} />} />

      </Routes>
    </Router>
  );
}

export default App;
