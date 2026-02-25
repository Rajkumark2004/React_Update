import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { User, Lock } from "lucide-react";
import { api_users } from "../../../services/api_users";
import { useSession } from "../../../context/SessionContext";

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
      const response = await api_users.userLogin(username, password);

      // Store user data in localStorage
      // The API returns the user details in `data` and the token at the root `token`
      const sessionData = {
        ...response.data,
        token: response.token
      };
      localStorage.setItem("user", JSON.stringify(sessionData));
      localStorage.setItem("token", response.token);
      localStorage.setItem("isLoggedIn", "true");

      // Initialize default session from General Settings
      await initDefaultSession();

      // Redirect to dashboard (handled by AppUsers sub-router)
      navigate("/user/dashboard");
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

        <h2>User Login</h2>

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

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
            <a href="#" className="forgot-password" onClick={(e) => {
              e.preventDefault();
              navigate("/user/forgot-password");
            }}>
              Forgot Password?
            </a>
            <a href="/login" className="forgot-password">
              Admin Login
            </a>
          </div>
        </form>
      </div>
    </div >
  );
}
