const express = require('express');
const router = express.Router();
const User = require('../models/User');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

router.post('/add', async (req, res) => {
  const { userId, mood, moodScore = 0, contentType = '', title = '', section = '' } = req.body;

  if (!userId || !mood) {
    return res.status(400).json({ error: 'userId and mood required' });
  }

  try {
    if (!ObjectId.isValid(userId)) return res.json({ ok: true }); // skip if anon

    await User.findByIdAndUpdate(userId, {
      $push: {
        moodHistory: {
          mood,
          moodScore,
          detectedAt: new Date(),
          context: {
            contentType,
            title,
            section
          }
        }
      }
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to save mood history:', err);
    res.status(500).json({ error: 'DB error' });
  }
});

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!ObjectId.isValid(userId)) return res.json([]);

  try {
    const user = await User.findById(userId, 'moodHistory');
    res.json(user?.moodHistory || []);
  } catch (err) {
    console.error('Failed to fetch mood history:', err);
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

module.exports = router;
