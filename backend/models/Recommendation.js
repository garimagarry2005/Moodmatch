const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: ["movie", "series", "video"], required: true },
  mood: { type: String, required: true }, // "happy", "sad", "motivated", etc.
  platform: { type: String, required: true }, // "Netflix", "YouTube", etc.
  thumbnail: { type: String }, // optional: link to image
  url: { type: String }, // optional: watch link
});

module.exports = mongoose.model("Recommendation", recommendationSchema);
