const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const userRoutes = require("./routes/user");

const detectMoodRoute = require('./routes/detectmood');

app.use('/api/detect-mood', detectMoodRoute);
app.use('/api/detect-text-mood', require('./routes/detect-Text-mood'));

const youtubeRoutes = require('./routes/youtube');
app.use('/api/youtube', youtubeRoutes);

const moodHistoryRoutes = require('./routes/moodHistory');
app.use('/api/mood-history', moodHistoryRoutes);


app.get('/', (req, res) => {
  res.send('MoodMatch backend is working!');
});


app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", userRoutes);
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

