const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const mongoose = require('mongoose');
const User = require('../models/User'); // ✅ Import User model

// Upload folder (inside Windows filesystem)
const upload = multer({ dest: path.join(__dirname, '../../uploads') }); // adjust if needed

router.post('/', upload.single('image'), (req, res) => {
  const imagePath = path.resolve(req.file.path); // absolute Windows path
  const driveLetter = imagePath[0].toLowerCase();
  const wslImagePath = `/mnt/${driveLetter}${imagePath.slice(2).replace(/\\/g, '/')}`;

  console.log('WSL Image Path:', wslImagePath);

  // Call detect_mood.py (Hugging Face version)
  const predictMood = spawn('wsl', [
    '/home/garima/OpenFace/venv/bin/python3',
    '/home/garima/OpenFace/detect_mood.py',
    wslImagePath
  ]);

  let output = '';

  predictMood.stdout.on('data', (data) => {
    output += data.toString();
  });

  predictMood.stderr.on('data', (data) => {
    console.error(`[Python ERROR]: ${data.toString()}`);
  });

  predictMood.on('close', async (code) => {
    fs.unlink(imagePath, () => {}); // delete uploaded image

    if (code === 0) {
      const mood = output.trim();
      const score = mood === 'happy' ? 3 : mood === 'sad' ? -3 : 0;

      const userId = req.body.userId; // ✅ Expect userId from frontend

      // ✅ Save mood to MongoDB if userId is valid
      if (userId && userId !== 'anon' && mongoose.Types.ObjectId.isValid(userId)) {
        try {
          await User.findByIdAndUpdate(userId, {
            $push: {
              moodHistory: {
                mood,
                moodScore: score,
                detectedAt: new Date(),
                context: {
                  contentType: "face",
                  title: "Face mood detection",
                  section: "moodDetect"
                }
              }
            }
          });
        } catch (err) {
          console.error('Failed to save mood history:', err);
        }
      }

      res.json({ mood, score });
    } else {
      res.status(500).json({ error: 'Mood prediction failed' });
    }
  });
});

module.exports = router;
