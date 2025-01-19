const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const User = require("./models/User");
const Mood = require("./models/Mood");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "https://mood-tracker-app-client.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors());

const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = "secret";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  console.log("Authorization Header:", authHeader);
  console.log("Extracted Token:", token);

  if (!token) {
    console.error("No token provided!");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("Invalid token:", err.message);
      return res.status(403).json({ error: "Invalid token." });
    }
    console.log("Valid Token for User:", user);
    req.user = user;
    next();
  });
};

app.get("/", (req, res) => {
  res.send("Welcome to the Mood Tracker API!");
});

app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res
      .status(201)
      .json({ userId: user._id, message: "User registered successfully!" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Error registering user." });
  }
});

app.post("/login", async (req, res) => {
  console.log("Login request received:", req.body);
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log("User found:", user);

    if (!user) {
      console.error("User not found for email:", email);
      return res.status(404).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      console.error("Invalid credentials for email:", email);
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log("Generated token:", token);

    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Error logging in." });
  }
});

app.post("/moods", authenticateToken, async (req, res) => {
  const { date, mood, note } = req.body;
  try {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    console.log(
      "Updating mood for date:",
      normalizedDate,
      "with mood:",
      mood,
      "and note:",
      note
    );

    const updatedMood = await Mood.findOneAndUpdate(
      { userId: req.user.userId, date: normalizedDate },
      { mood, note, date: normalizedDate, userId: req.user.userId },
      { upsert: true, new: true }
    );

    if (!updatedMood) {
      return res
        .status(404)
        .json({ error: "Mood not found for the specified date." });
    }

    res
      .status(200)
      .json({ message: "Mood updated successfully!", mood: updatedMood });
  } catch (error) {
    console.error("Error updating mood:", error);
    res.status(500).json({ error: "Error updating mood." });
  }
});

app.get("/moods/month", authenticateToken, async (req, res) => {
  const { year, month } = req.query;
  try {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, parseInt(month) + 1, 0, 23, 59, 59);

    console.log("Start of Month:", startOfMonth);
    console.log("End of Month:", endOfMonth);

    const moods = await Mood.find({
      userId: req.user.userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    console.log("Fetched Moods:", moods);
    res.status(200).json(moods);
  } catch (error) {
    console.error("Error fetching moods for the month:", error);
    res.status(500).json({ error: "Error fetching moods for the month." });
  }
});

app.get("/moods/summary", authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    sevenDaysAgo.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(23, 59, 59, 999);

    console.log("Date range for query:", sevenDaysAgo, "to:", today);

    const moods = await Mood.find({
      userId: req.user.userId,
      date: { $gte: sevenDaysAgo, $lte: today },
    });

    console.log("Moods fetched from the database:", moods);

    const summary = {
      Happy: 0,
      Neutral: 0,
      Sad: 0,
      Angry: 0,
      Tired: 0,
    };

    moods.forEach((mood) => {
      console.log("Processing mood:", mood.mood);
      if (summary[mood.mood] !== undefined) {
        summary[mood.mood]++;
      } else {
        console.warn("Invalid mood found:", mood.mood);
      }
    });

    console.log("Final summary:", summary);
    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error fetching weekly summary:", error);
    res.status(500).json({ error: "Error fetching weekly summary." });
  }
});

app.get("/moods/prediction", authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const pastDays = new Date();
    pastDays.setDate(today.getDate() - 3);

    pastDays.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(23, 59, 59, 999);

    console.log("Fetching moods for prediction from:", pastDays, "to:", today);

    const moods = await Mood.find({
      userId: req.user.userId,
      date: { $gte: pastDays, $lte: today },
    });

    console.log("Fetched moods for prediction:", moods);

    if (moods.length === 0) {
      return res
        .status(200)
        .json({ prediction: "No data available for prediction." });
    }

    const moodCounts = {};
    moods.forEach((mood) => {
      if (moodCounts[mood.mood]) {
        moodCounts[mood.mood]++;
      } else {
        moodCounts[mood.mood] = 1;
      }
    });

    console.log("Mood counts:", moodCounts);

    let predictedMood = Object.keys(moodCounts).reduce((a, b) =>
      moodCounts[a] > moodCounts[b] ? a : b
    );

    let message = `You might feel ${predictedMood} tomorrow!`;
    if (predictedMood === "Tired") {
      message += " Consider getting some rest.";
    }

    res.status(200).json({ prediction: message });
  } catch (error) {
    console.error("Error generating mood prediction:", error);
    res.status(500).json({ error: "Error generating mood prediction." });
  }
});

app.delete("/moods", authenticateToken, async (req, res) => {
  const { date } = req.body;

  try {
    const normalizedDate = new Date(date);
    normalizedDate.setUTCHours(0, 0, 0, 0);

    const deletedMood = await Mood.findOneAndDelete({
      userId: req.user.userId,
      date: normalizedDate,
    });

    if (!deletedMood) {
      return res
        .status(404)
        .json({ error: "Mood not found for the specified date." });
    }

    res.status(200).json({ message: "Mood deleted successfully!" });
  } catch (error) {
    console.error("Error deleting mood:", error);
    res.status(500).json({ error: "Error deleting mood." });
  }
});

module.exports = app;
