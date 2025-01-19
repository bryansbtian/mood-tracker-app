const MoodSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
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

MoodSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Mood", MoodSchema);
