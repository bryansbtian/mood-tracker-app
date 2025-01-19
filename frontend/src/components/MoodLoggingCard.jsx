import React, { useState } from "react";
import { BiSolidHappy } from "react-icons/bi";
import {
  BsEmojiNeutralFill,
  BsEmojiFrownFill,
  BsEmojiAngryFill,
} from "react-icons/bs";
import { FaTired } from "react-icons/fa";
import "./MoodLoggingCard.css";
import { motion } from "framer-motion";

const MoodLoggingCard = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState("");

  const handleMoodSelect = (mood) => {
    setSelectedMood(mood);
  };

  const handleConfirm = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to log your mood.");
      return;
    }

    if (selectedMood) {
      try {
        const response = await fetch("http://localhost:5000/moods", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            date: new Date().toISOString(),
            mood: selectedMood,
            note,
          }),
        });

        if (response.ok) {
          alert("Mood logged successfully!");
        } else {
          const errorData = await response.json();
          alert(`Failed to log mood: ${errorData.message || errorData.error}`);
        }
      } catch (error) {
        console.error("Error logging mood:", error);
        alert("An error occurred while logging mood.");
      }
    } else {
      alert("Please select a mood!");
    }
  };

  return (
    <motion.div
      whileInView={{ opacity: 1, x: 0 }}
      initial={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5 }}
      className="card mood-card"
    >
      <h1>How are you feeling today?</h1>
      <div className="emoji-container">
        <div
          className={`emoji-item ${selectedMood === "Happy" ? "selected" : ""}`}
          onClick={() => handleMoodSelect("Happy")}
        >
          <button className="emoji-button">
            <BiSolidHappy size={32} />
          </button>
          <h4>Happy</h4>
        </div>
        <div
          className={`emoji-item ${
            selectedMood === "Neutral" ? "selected" : ""
          }`}
          onClick={() => handleMoodSelect("Neutral")}
        >
          <button className="emoji-button">
            <BsEmojiNeutralFill size={32} />
          </button>
          <h4>Neutral</h4>
        </div>
        <div
          className={`emoji-item ${selectedMood === "Sad" ? "selected" : ""}`}
          onClick={() => handleMoodSelect("Sad")}
        >
          <button className="emoji-button">
            <BsEmojiFrownFill size={32} />
          </button>
          <h4>Sad</h4>
        </div>
        <div
          className={`emoji-item ${selectedMood === "Angry" ? "selected" : ""}`}
          onClick={() => handleMoodSelect("Angry")}
        >
          <button className="emoji-button">
            <BsEmojiAngryFill size={32} />
          </button>
          <h4>Angry</h4>
        </div>
        <div
          className={`emoji-item ${selectedMood === "Tired" ? "selected" : ""}`}
          onClick={() => handleMoodSelect("Tired")}
        >
          <button className="emoji-button">
            <FaTired size={32} />
          </button>
          <h4>Tired</h4>
        </div>
      </div>
      <input
        type="text"
        id="notes"
        name="notes"
        placeholder="Add a note..."
        className="note-input"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button className="confirm-button" onClick={handleConfirm}>
        Confirm
      </button>
    </motion.div>
  );
};

export default MoodLoggingCard;
