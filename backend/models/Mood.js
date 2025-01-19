const mongoose = require("mongoose");

const MoodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
    unique: true,
  },
  mood: {
    type: String,
    required: true,
    enum: ["Happy", "Neutral", "Sad", "Angry", "Tired"],
  },
  note: {
    type: String,
    maxlength: 200,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Mood", MoodSchema);
