const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const mongoose = require('mongoose');
const User = require('../models/User');
const ObjectId = mongoose.Types.ObjectId;

router.post('/', async (req, res) => {
  const text = req.body.text;
  const userId = req.body.userId || 'anon';

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const moodProc = spawn('wsl', [
    '/home/garima/OpenFace/venv/bin/python3',
    '/home/garima/OpenFace/detect_mood_text.py',
    `"${text}"`
  ], { shell: true });

  let output = '';

  moodProc.stdout.on('data', (data) => {
    output += data.toString();
  });

  moodProc.stderr.on('data', (data) => {
    console.error('[Python ERROR]:', data.toString());
  });

  moodProc.on('close', async (code) => {
    if (code === 0) {
      const mood = output.trim();

      // ✅ Save mood history if user is logged in
      if (ObjectId.isValid(userId) && userId !== 'anon') {
        try {
          await User.findByIdAndUpdate(userId, {
            $push: {
              moodHistory: {
                mood,
                moodScore: 0, // you can compute actual score if needed
                detectedAt: new Date(),
                context: {
                  contentType: 'voice',
                  title: 'Detected Mood (Voice)',
                  section: 'moodDetect'
                }
              }
            }
          });
        } catch (err) {
          console.error('❌ Failed to save mood history:', err);
        }
      }

      res.json({ mood });
    } else {
      res.status(500).json({ error: 'Mood detection failed.' });
    }
  });

  moodProc.stdin.write(text);
  moodProc.stdin.end();
});

module.exports = router;
