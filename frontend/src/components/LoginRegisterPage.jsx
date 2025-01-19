import React, { useState, useEffect } from "react";
import "./LoginRegisterPage.css";
import { API_BASE_URL } from ".../config";

const LoginRegisterPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", password: "", confirmPassword: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? "/login" : "/register";
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(isLogin ? "Login successful!" : "Registration successful!");
        if (isLogin) {
          localStorage.setItem("token", data.token);
          setIsLoggedIn(true);
        }
      } else {
        const errorData = await response.json();
        alert(
          `${isLogin ? "Login" : "Registration"} failed: ${errorData.error}`
        );
      }
    } catch (error) {
      console.error("Error during login/registration:", error);
      alert("An error occurred. Please try again.");
    }

    setIsModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    alert("Logged out successfully!");
  };

  return (
    <div>
      {!isLoggedIn ? (
        <button
          className="open-modal-button"
          onClick={() => setIsModalOpen(true)}
        >
          Login / Register
        </button>
      ) : (
        <button className="open-modal-button" onClick={handleLogout}>
          Logout
        </button>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form className="form-container" onSubmit={handleSubmit}>
              <h2>{isLogin ? "Login" : "Register"}</h2>

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />

              {!isLogin && (
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              )}

              <button type="submit">{isLogin ? "Login" : "Register"}</button>
              <p onClick={handleToggle} className="toggle-text">
                {isLogin
                  ? "Don't have an account? Register"
                  : "Already have an account? Login"}
              </p>
              <button
                type="button"
                className="close-modal-button"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginRegisterPage;
