import React, { useState, useEffect } from "react";
import "./LoginRegisterPage.css";

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

    if (isLogin) {
      try {
        const response = await fetch("http://localhost:5000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          alert("Login successful!");
          console.log("Login Response:", data);
          localStorage.setItem("token", data.token);
          setIsLoggedIn(true);
        } else {
          const errorData = await response.json();
          alert(`Login failed: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error logging in:", error);
        alert("An error occurred while logging in.");
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          alert("Registration successful!");
          console.log("Registration Response:", data);
        } else {
          const errorData = await response.json();
          alert(`Registration failed: ${errorData.error}`);
        }
      } catch (error) {
        console.error("Error registering:", error);
        alert("An error occurred while registering.");
      }
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
