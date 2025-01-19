import React, { useEffect, useState } from "react";
import "./App.css";
import LoginRegisterPage from "./components/LoginRegisterPage";
import LightDarkModeToggle from "./components/LightDarkModeToggle";
import MoodLoggingCard from "./components/MoodLoggingCard";
import MoodPredictionCard from "./components/MoodPredictionCard";
import MoodDataCard from "./components/MoodDataCard";
import MoodSummaryCard from "./components/MoodSummaryCard";

const App = () => {
  const [weeklyData, setWeeklyData] = useState({});
  const [prediction, setPrediction] = useState("");

  useEffect(() => {
    const fetchWeeklySummary = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found for fetching weekly summary");
          return;
        }

        const response = await fetch("http://localhost:5000/moods/summary", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched weekly summary data:", data);
          setWeeklyData(data.summary);
        } else {
          console.error(
            `Failed to fetch weekly summary: ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error fetching weekly summary:", error);
      }
    };

    const fetchPrediction = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found for fetching prediction");
          return;
        }

        const response = await fetch("http://localhost:5000/moods/prediction", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched prediction:", data);
          setPrediction(data.prediction);
        } else {
          console.error(`Failed to fetch prediction: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error fetching prediction:", error);
      }
    };

    fetchWeeklySummary();
    fetchPrediction();
  }, []);

  return (
    <div>
      <div className="header-container">
        <LoginRegisterPage />
        <LightDarkModeToggle />
      </div>
      <MoodLoggingCard />
      <MoodPredictionCard prediction={prediction} />
      <div className="app-container">
        <MoodDataCard />
        <MoodSummaryCard weeklyData={weeklyData} />
      </div>
    </div>
  );
};

export default App;
