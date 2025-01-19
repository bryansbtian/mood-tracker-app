import React, { useState } from "react";
import "./LightDarkModeToggle.css";
import { MdOutlineLightMode, MdDarkMode } from "react-icons/md";

const LightDarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.body.className = newMode ? "dark-mode" : "light-mode";
  };

  return (
    <div className="mode-toggle-container">
      {isDarkMode ? (
        <MdOutlineLightMode className="mode-icon" onClick={toggleMode} />
      ) : (
        <MdDarkMode className="mode-icon" onClick={toggleMode} />
      )}
    </div>
  );
};

export default LightDarkModeToggle;
