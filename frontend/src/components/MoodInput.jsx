import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MoodInput = () => {
  const [moodText, setMoodText] = useState('');
  const [detectedMood, setDetectedMood] = useState('');
  const [listening, setListening] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Voice input using Web Speech API
  const handleVoiceInput = () => {
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  setListening(true);
  recognition.start();

  // recognition.onresult = async (event) => {
  //   const transcript = event.results[0][0].transcript;
  //   setMoodText(transcript);
  //   setDetectedMood(`You said: ${transcript}`);
  //   setListening(false);

  //   // 🔥 Send text to backend to detect mood
  //   try {
  //     const response = await axios.post('http://localhost:5000/api/detect-text-mood', {
  //       text: transcript
  //     });
  //     setDetectedMood(`Detected from voice: ${response.data.mood}`);
  //     setMoodText(response.data.mood);
  //   } catch (error) {
  //     console.error('Voice mood detection failed:', error);
  //     alert('Voice detection failed.');
  //   }
  // };

  recognition.onresult = async (event) => {
  const transcript = event.results[0][0].transcript;
  setMoodText(transcript);
  setDetectedMood(`You said: ${transcript}`);
  setListening(false);

  try {
    const response = await axios.post('http://localhost:5000/api/detect-text-mood', {
      text: transcript,
      userId: localStorage.getItem("userId") || "anon"
    });
    const mood = response.data.mood;
    setDetectedMood(`Detected from voice: ${mood}`);
    setMoodText(mood);

    // ✅ Redirect to result page with mood
    navigate(`/result?mood=${encodeURIComponent(mood)}`);
  } catch (error) {
    console.error('Voice mood detection failed:', error);
    alert('Voice detection failed.');
  }
};


  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    alert(`Voice recognition failed: ${event.error}`);
    setListening(false);
  };
};


  // Camera stream for face detection
  const handleFaceDetection = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      setTimeout(async () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));

        const formData = new FormData();
        formData.append('image', blob);
        formData.append('userId', localStorage.getItem('userId') || 'anon');

        // Stop the video stream
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());

        // Send image to backend for mood detection
        const response = await axios.post('http://localhost:5000/api/detect-mood', formData);
        const mood = response.data.mood;

        setDetectedMood(`Detected from face: ${mood}`);
        setMoodText(mood);

        // ✅ Redirect to result page with mood
        navigate(`/result?mood=${encodeURIComponent(mood)}`);
      }, 3000);
    } catch (error) {
      console.error('Face detection error:', error);
      alert('Face detection failed.');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h3 className="mb-2">How are you feeling?</h3>
      <p className="text-muted">Express your mood with voice or facial recognition</p>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="I'm feeling..."
        value={moodText}
        onChange={(e) => setMoodText(e.target.value)}
      />

      <button className="btn btn-primary w-100 mb-2" onClick={handleVoiceInput} disabled={listening}>
        🎤 {listening ? 'Listening...' : 'Say your mood'}
      </button>

      <div className="text-center mb-2 text-muted">or</div>

      <button className="btn btn-outline-primary w-100 mb-4" onClick={handleFaceDetection}>
        🧠 Detect from face
      </button>

      <div className="position-relative" style={{ textAlign: 'center' }}>
        <video ref={videoRef} width="100%" height="auto" className="rounded shadow" />
        <canvas ref={canvasRef} width="640" height="480" hidden />
      </div>

      {detectedMood && (
        <div className="alert alert-info mt-4">
          <strong>{detectedMood}</strong>
        </div>
      )}
    </div>
  );
};

export default MoodInput;
