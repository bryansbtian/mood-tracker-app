import React from "react";
import "./MoodPredictionCard.css";
import { motion } from "framer-motion";

const MoodPredictionCard = ({ prediction }) => {
  return (
    <motion.div
      whileInView={{ opacity: 1, x: 0 }}
      initial={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="card mood-prediction-card"
    >
      <h2>Mood Prediction:</h2>
      <p>{prediction}</p>
    </motion.div>
  );
};

export default MoodPredictionCard;
