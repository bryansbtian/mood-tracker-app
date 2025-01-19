import React, { useState, useEffect } from "react";
import "./MoodDataCard.css";
import { motion } from "framer-motion";
import { API_BASE_URL } from "../../config";

const MoodDataCard = () => {
  const currentYear = new Date().getFullYear();
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [monthMoods, setMonthMoods] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [moodData, setMoodData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMood, setEditedMood] = useState("");
  const [editedNote, setEditedNote] = useState("");

  const moods = ["Happy", "Neutral", "Sad", "Angry", "Tired"];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysInMonth = (month) => new Date(currentYear, month + 1, 0).getDate();

  const getFirstDayOfMonth = (month) =>
    new Date(currentYear, month, 1).getDay();

  const fetchMonthMoods = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage!");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/moods/month?year=${currentYear}&month=${currentMonth}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched month moods:", data);
        setMonthMoods(data);
      } else {
        console.error(`Failed to fetch moods: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error fetching moods for the month:", error);
    }
  };

  useEffect(() => {
    fetchMonthMoods();
  }, [currentMonth]);

  const handleDateClick = (day) => {
    const selected = new Date(currentYear, currentMonth, day);
    selected.setHours(0, 0, 0, 0);
    setSelectedDate(selected);

    const mood = monthMoods.find((m) => {
      const moodDate = new Date(m.date);
      return (
        moodDate.getUTCFullYear() === selected.getUTCFullYear() &&
        moodDate.getUTCMonth() === selected.getUTCMonth() &&
        moodDate.getUTCDate() === selected.getUTCDate()
      );
    });

    setMoodData(mood || { mood: "No mood logged", note: "No note available" });
    setIsModalOpen(true);
  };

  const handleMonthChange = (direction) => {
    setCurrentMonth((prevMonth) => {
      const newMonth = prevMonth + direction;
      return newMonth < 0 ? 0 : newMonth > 11 ? 11 : newMonth;
    });
  };

  const handleEditButtonClick = () => {
    setEditedMood(moodData?.mood || "");
    setEditedNote(moodData?.note || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedMood || !editedNote.trim()) {
      alert("Please select a mood and enter a note.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to update a mood.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/moods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
          mood: editedMood,
          note: editedNote,
        }),
      });

      if (response.ok) {
        const updatedMood = await response.json();
        alert("Mood updated successfully!");

        fetchMonthMoods();
        setMoodData({ mood: editedMood, note: editedNote });
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to update mood: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.error("Error updating mood:", error);
      alert("An error occurred while updating mood.");
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to delete a mood.");
      return;
    }

    if (!selectedDate) {
      alert("Please select a date to delete the mood.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/moods`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
        }),
      });

      if (response.ok) {
        alert("Mood deleted successfully!");
        fetchMonthMoods();
        setMoodData(null);
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete mood: ${errorData.message || errorData.error}`);
      }
    } catch (error) {
      console.error("Error deleting mood:", error);
      alert("An error occurred while deleting mood.");
    }
  };

  return (
    <motion.div
      whileInView={{ opacity: 1, x: 0 }}
      initial={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="calendar-container"
    >
      <header className="calendar-header">
        <button
          className="nav-button"
          onClick={() => handleMonthChange(-1)}
          disabled={currentMonth === 0}
        >
          {"<"}
        </button>
        <h2>{`${months[currentMonth]} ${currentYear}`}</h2>
        <button
          className="nav-button"
          onClick={() => handleMonthChange(1)}
          disabled={currentMonth === 11}
        >
          {">"}
        </button>
      </header>
      <div className="calendar-grid">
        {daysOfWeek.map((day) => (
          <div key={day} className="day-label">
            {day}
          </div>
        ))}
        {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map(
          (_, i) => (
            <div key={`empty-${i}`} className="calendar-day empty"></div>
          )
        )}
        {Array.from({ length: daysInMonth(currentMonth) }, (_, i) => (
          <button
            key={i}
            className="calendar-day"
            onClick={() => handleDateClick(i + 1)}
          >
            <span>{i + 1}</span>
          </button>
        ))}
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              Mood Details for{" "}
              {selectedDate && selectedDate.toLocaleDateString()}
            </h3>
            {isEditing ? (
              <>
                <label>
                  Mood:
                  <select
                    value={editedMood}
                    onChange={(e) => setEditedMood(e.target.value)}
                  >
                    <option value="" disabled>
                      Select a mood
                    </option>
                    {moods.map((mood) => (
                      <option key={mood} value={mood}>
                        {mood}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Note:
                  <textarea
                    value={editedNote}
                    onChange={(e) => setEditedNote(e.target.value)}
                    placeholder="Enter additional notes"
                    className="note-textarea"
                  />
                </label>
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setIsEditing(false)}>Cancel</button>
              </>
            ) : (
              <>
                <p>
                  <strong>Mood:</strong> {moodData?.mood || "No mood logged"}
                </p>
                <p>
                  <strong>Note:</strong> {moodData?.note || "No note available"}
                </p>
                <button onClick={handleEditButtonClick}>Edit</button>
                <button onClick={handleDelete}>Delete</button>
              </>
            )}
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MoodDataCard;
