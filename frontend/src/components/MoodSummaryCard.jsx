import React from "react";
import "./MoodSummaryCard.css";
import { motion } from "framer-motion";

const MoodSummaryCard = ({ weeklyData }) => {
  const moods = ["Happy", "Neutral", "Sad", "Angry", "Tired"];

  return (
    <motion.div
      whileInView={{ opacity: 1, x: 0 }}
      initial={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5 }}
      className="card summary-card"
    >
      <h2 className="summary-title">Weekly Summary</h2>
      <div className="summary-chart">
        {moods.map((mood, index) => (
          <div key={mood} className="chart-bar">
            <div
              className="bar"
              style={{ height: `${(weeklyData[mood] || 0) * 20}px` }}
            >
              <span className="bar-value">{weeklyData[mood] || 0}</span>
            </div>
            <span className="bar-label">{mood}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default MoodSummaryCard;
