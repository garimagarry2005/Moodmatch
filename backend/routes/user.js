const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");
const Recommendation = require("../models/Recommendation");

// GET /api/user/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/user/mood
// router.get("/mood", auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     res.json({ mood: user.mood });
//   } catch (err) {
//     res.status(500).json({ msg: "Error fetching mood" });
//   }
// });

// // POST /api/user/mood
// router.post("/mood", auth, async (req, res) => {
//   const { mood } = req.body;
//   try {
//     const user = await User.findByIdAndUpdate(
//       req.user.id,
//       { mood },
//       { new: true }
//     );
//     res.json({ msg: "Mood updated", mood: user.mood });
//   } catch (err) {
//     res.status(500).json({ msg: "Error updating mood" });
//   }
// });

router.post("/update-mood", auth, async (req, res) => {
  const { mood } = req.body;
  try {
    await User.findByIdAndUpdate(req.user.id, { mood });
    res.json({ msg: "Mood updated" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/user/recommendations
router.get("/recommendations", auth, async (req, res) => {
  try {
    // Get the logged-in user's ID from authMiddleware
    const user = await User.findById(req.user.id);
    if (!user || !user.mood) {
      return res.status(400).json({ msg: "Mood not found for user" });
    }

    // Find recommendations that match user's mood
    const recommendations = await Recommendation.find({ mood: user.mood });

    res.json(recommendations);
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    res.status(500).json({ msg: "Server error" });
  }
});


module.exports = router;
