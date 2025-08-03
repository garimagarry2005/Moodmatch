// scripts/seedRecommendations.js

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const mongoose = require('mongoose');
const Recommendation = require('../models/Recommendation');

const data = [
  {
    title: "The Pursuit of Happyness",
    type: "movie",
    mood: "motivated",
    platform: "Netflix",
    thumbnail: "/images/pursuit.jpg",
    url: "https://www.netflix.com/watch/123456"
  },
  {
    title: "Friends",
    type: "series",
    mood: "happy",
    platform: "Netflix",
    thumbnail: "/images/friends.jpg",
    url: "https://www.netflix.com/watch/654321"
  },
  {
    title: "Sad Piano Music",
    type: "video",
    mood: "sad",
    platform: "YouTube",
    thumbnail: "/images/piano.jpg",
    url: "https://www.youtube.com/watch?v=sad-mood"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Recommendation.deleteMany({});
    await Recommendation.insertMany(data);
    console.log("🌱 Seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
