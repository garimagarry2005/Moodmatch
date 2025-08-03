const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, unique: true },
  password: { type: String, required: true },
  mood:     { type: String, default: "" },

  preferences: {
    contentTypes: [String] // e.g., ["music", "comedy", "movies"]
  },

  History: [
    {
      videoId:  String,
      section:  String,
      contentId: String, // for future: movie IDs, etc.
      watchedAt: { type: Date, default: Date.now }
    }
  ],
 moodHistory: [
  {
    mood: String,         // e.g., "happy"
    moodScore: Number,    // e.g., 4
    detectedAt: {
      type: Date,
      default: Date.now
    },
    context: {
      contentType: String,  // e.g., "comedy"
      title: String,        // optional
      section: String       // optional
    }
  }
]

,

  feedback: [
    {
      videoId: String,
      liked:   Boolean,
      ts:      { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
