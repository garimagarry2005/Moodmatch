// File: routes/youtube.js

const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const Sentiment = require('sentiment');
const ytsr = require('ytsr');
const mongoose = require('mongoose');
const User = require('../models/User');

const router = express.Router();
const sentiment = new Sentiment();
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
const ObjectId = mongoose.Types.ObjectId;

const YT_KEY = process.env.YOUTUBE_API_KEY;
if (!YT_KEY) throw new Error('Missing YOUTUBE_API_KEY');

function normalizeMood(m = '') {
  const mood = m.trim().toLowerCase();
  if (/^sad(ness)?|down|blue|broken|melancholy/.test(mood)) return 'sad';
  if (/^angry|mad|furious|rage/.test(mood)) return 'angry';
  if (/^happy|joy|excited|cheerful|elated/.test(mood)) return 'happy';
  if (/^relax|calm|peaceful|chill|soothing/.test(mood)) return 'relaxed';
  return 'default';
}

function getTimeContext() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; --i) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const verticalsConfig = {
  sad: [
    { title: "🌈 Motivational Talks", query: "overcoming sadness motivation", maxItems: 8 },
    { title: "🎵 Feel-Good Music", query: "happy mood songs playlist", maxItems: 8 },
    { title: "😂 Comedy Clips", query: "funniest YouTube shorts", maxItems: 8 },
    { title: "🌄 Relaxing Visuals", query: "relaxing scenery with music", maxItems: 8 },
  ],
  happy: [
    { title: "🎉 Celebration Songs", query: "party songs Hindi", maxItems: 8 },
    { title: "📈 Trending Shorts", query: "YouTube trending shorts India", maxItems: 8 },
    { title: "🎬 Viral Movie Scenes", query: "iconic Bollywood scenes", maxItems: 8 },
  ],
  relaxed: [
    { title: "🌿 Nature Sounds", query: "deep sleep lofi nature sounds", maxItems: 8 },
    { title: "🧘 Guided Meditation", query: "10 min guided meditation", maxItems: 8 },
    { title: "📖 Storytime Videos", query: "relaxing bedtime stories", maxItems: 8 },
  ],
  angry: [
    { title: "🫁 Breathing Exercises", query: "5 min breathing calm anger", maxItems: 8 },
    { title: "🎹 Peaceful Piano", query: "calm piano instrumental music", maxItems: 8 },
    { title: "🌌 Space/Nature Videos", query: "soothing cosmic visuals", maxItems: 8 },
  ],
  default: [
    { title: "🔥 Trending Now", query: "YouTube trending India", maxItems: 8 },
    { title: "🌟 Best of the Month", query: "top viral videos 2024", maxItems: 8 },
    { title: "🧠 Ted Talks / Wisdom", query: "best ted talks 2024", maxItems: 8 },
  ]
};

async function fetchFromYT(q, max = 10) {
  const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
    params: { key: YT_KEY, part: 'snippet', q, type: 'video', maxResults: max, videoEmbeddable: 'true' }
  });
  const ids = res.data.items.map(i => i.id.videoId).join(',');
  const detail = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
    params: { key: YT_KEY, part: 'contentDetails,statistics', id: ids }
  });
  const stats = Object.fromEntries(detail.data.items.map(v => [v.id, v]));
  return res.data.items.map(item => {
    const snip = item.snippet;
    const st = stats[item.id.videoId] || {};
    const dur = st.contentDetails?.duration || 'PT0S';
    const [, h = '0', m = '0', s = '0'] = dur.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/) || [];
    return {
      videoId: item.id.videoId,
      title: snip.title,
      channel: snip.channelTitle,
      thumbnail: snip.thumbnails.medium.url,
      views: +st.statistics?.viewCount || 0,
      durationSec: (+h) * 3600 + (+m) * 60 + (+s),
      publishedAt: snip.publishedAt
    };
  });
}

async function fetchFromYtsr(q, max = 10) {
  try {
    const r = await ytsr(q, { limit: max });
    return r.items.filter(i => i.type === 'video').map(i => {
      let views = typeof i.views === 'string' ? Number(i.views.replace(/,/g, '')) : (i.views || 0);
      let durationSec = 0;
      if (typeof i.duration === 'string' && i.duration.includes(':')) {
        durationSec = i.duration.split(':').reduce((acc, part) => acc * 60 + Number(part), 0);
      }
      return {
        videoId: i.id,
        title: i.title,
        channel: i.author.name,
        thumbnail: i.bestThumbnail.url,
        views,
        durationSec,
        publishedAt: i.ago
      };
    });
  } catch (err) {
    console.warn('⚠️ ytsr fallback failed:', err.message);
    return [];
  }
}

function filterDedup(arr, cfg = {}) {
  const seen = new Set();
  return arr.filter(v => {
    if (cfg.minViews && v.views < cfg.minViews) return false;
    if (cfg.maxDurSec && v.durationSec > cfg.maxDurSec) return false;
    if (cfg.minDurSec && v.durationSec < cfg.minDurSec) return false;
    if (cfg.publishedDays) {
      const age = (Date.now() - new Date(v.publishedAt)) / 86400000;
      if (age > cfg.publishedDays) return false;
    }
    if (cfg.sentimentMin != null && sentiment.analyze(v.title).score < cfg.sentimentMin) return false;
    if (seen.has(v.channel)) return false;
    seen.add(v.channel);
    return true;
  });
}

async function buildForYou(userId) {
  if (!ObjectId.isValid(userId)) return [];
  const user = await User.findById(userId);
  if (!user) return [];

  const liked = new Set(user.feedback?.filter(f => f.liked).map(f => f.videoId) || []);
  const history = user.watchHistory?.slice(-10) || [];
  const lastIds = history.map(h => h.videoId);

  const recs = (await Promise.all(
    lastIds.map(id =>
      fetchFromYT(`https://youtu.be/${id}`, 5).catch(() => fetchFromYtsr(`https://youtu.be/${id}`, 5))
    )
  )).flat();

  const withScore = recs.map(v => ({ ...v, score: liked.has(v.videoId) ? 1 : 0 }));
  const deduped = shuffle(withScore);
  deduped.sort((a, b) => b.score - a.score);

  return deduped.slice(0, 8);
}

// ✅ FIXED: CastError avoided by checking ObjectId validity
router.get('/', async (req, res) => {
  const rawMood = req.query.mood || 'default';
  const mood = normalizeMood(rawMood);
  const userId = req.query.userId || 'anon';
  const force = req.query.forceRefresh === 'true';
  const score = parseInt(req.query.moodScore || 0);
  const key = `${userId}|${mood}|${score}`;

  let intensity = 'mild';
  if (score <= -3) intensity = 'severe';
  else if (score < 0) intensity = 'moderate';

  if (!force && cache.has(key)) {
    return res.json({
      videos: cache.get(key),
      playlist: cache.get(`${key}|plist`),
      cached: true
    });
  }

  try {
    let user = null;
    let prefs = [];

    if (ObjectId.isValid(userId)) {
      user = await User.findById(userId);
      prefs = user?.preferences?.contentTypes || [];
    }

    const time = getTimeContext();
    let verticals = verticalsConfig[mood] || [];

    if (prefs.length > 0) {
      verticals = verticals.filter(cfg =>
        prefs.some(p => cfg.query.toLowerCase().includes(p))
      );
    }

    if (mood === 'sad' && time === 'night') {
      verticals.unshift({
        title: "🌙 Sleep Music for Sad Moods",
        query: "deep sleep calming music sad mood",
        maxItems: 6
      });
    }

    const sections = await Promise.all(
      verticals.map(async cfg => {
        try {
          const raw = await fetchFromYT(cfg.query, 15).catch(e =>
            e.response?.status === 403 ? fetchFromYtsr(cfg.query, 15) : Promise.reject(e)
          );
          const items = shuffle(filterDedup(raw, cfg)).slice(0, cfg.maxItems);
          return { title: cfg.title, items };
        } catch (err) {
          console.warn(`Failed section ${cfg.title}:`, err.message);
          return { title: cfg.title, items: [] };
        }
      })
    );

    const personal = userId === 'anon' ? [] : await buildForYou(userId);
    const playlist = [...sections.flatMap(s => s.items), ...personal].map(v => v.videoId);

    const payload = { sections, personal };
    cache.set(key, payload);
    cache.set(`${key}|plist`, playlist);

    res.json({ videos: payload, playlist, cached: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed recommendations' });
  }
});

router.post('/history', async (req, res) => {
  const {
    userId = 'anon',
    videoId,
    section,
    mood = '',          // new
    moodScore = 0       // new
  } = req.body;

  if (!videoId || !section) return res.status(400).json({ error: 'videoId & section required' });

  try {
    if (ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          watchHistory: {
            contentId: null,
            watchedAt: new Date(),
            videoId,
            section
          },
          moodHistory: {
            mood,
            moodScore,
            detectedAt: new Date(),
            context: {
              contentType: 'video',
              title: '', // you can optionally include title if you pass it in req.body
              section
            }
          }
        }
      }, { upsert: true });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Failed to save watch/mood history:', err);
    res.status(500).json({ error: 'Failed to save history' });
  }
});


router.post('/feedback', async (req, res) => {
  const { userId = 'anon', videoId, liked } = req.body;
  if (!videoId || typeof liked !== 'boolean') {
    return res.status(400).json({ error: 'videoId and liked(boolean) required' });
  }
  try {
    if (ObjectId.isValid(userId)) {
      await User.findByIdAndUpdate(userId, {
        $push: {
          feedback: {
            videoId,
            liked,
            ts: new Date()
          }
        }
      }, { upsert: true });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save feedback' });
  }
});

module.exports = router;
