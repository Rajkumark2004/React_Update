import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { User, Lock } from "lucide-react";
import api from "../../services/api";
import { useSession } from "../../context/SessionContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Session Context
  const { initDefaultSession } = useSession();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.login(username, password);

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      localStorage.setItem("isLoggedIn", "true");

      // Initialize default session from General Settings
      await initDefaultSession();

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* LEFT SECTION */}
      <div
        className="login-left"
        style={{
          backgroundImage: "url('/images/Wisibles_BG.png')",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right center",
        }}
      ></div>

      {/* RIGHT SECTION */}
      <div className="login-right">

        {/* LOGO */}
        <div className="logo-placeholder">
          <img
            src="/images/wisibles_logo.png"
            alt="Wisibles Logo"
            style={{ width: "100%", height: "auto" }}
          />
        </div>

        <h2>Admin Login</h2>

        {error && (
          <div style={{ color: "red", marginBottom: "10px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-icon">
              <User size={20} />
            </div>
            <input
              type="text"
              placeholder="Username"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <div className="input-icon">
              <Lock size={20} />
            </div>
            <input
              type="password"
              placeholder="Password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <a href="#" className="forgot-password">
            Forgot Password?
          </a>
        </form>
      </div>
    </div >
  );
}
