import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { User, Lock, Loader2, X, ChevronRight, GraduationCap } from "lucide-react";
import { api_users } from "../../../services/api_users";
import { useSession } from "../../../context/SessionContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Child Selection Modal State
  const [showChildModal, setShowChildModal] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState("");
  const [isSubmittingChild, setIsSubmittingChild] = useState(false);

  // Session Context
  const { initDefaultSession } = useSession();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api_users.userLogin(username, password);

      // Store user data in localStorage
      const sessionData = {
        ...response.data,
        token: response.token,
        role: response.role // Ensure role is stored
      };
      localStorage.setItem("user", JSON.stringify(sessionData));
      localStorage.setItem("token", response.token);
      localStorage.setItem("isLoggedIn", "true");

      // Initialize default session from General Settings
      await initDefaultSession();

      // Check if role is parent
      if (response.role === "parent") {
        try {
          const res = await api_users.getStudentSessionClasses();
          if (res.status && res.data && res.data.studentclasses && res.data.studentclasses.length > 0) {
            setChildren(res.data.studentclasses);
            // Auto-select active one or first one
            const active = res.data.studentclasses.find(c => c.is_active === "yes");
            setSelectedChildId(active ? active.student_session_id : res.data.studentclasses[0].student_session_id);
            setShowChildModal(true);
            setLoading(false);
            return; // Don't navigate yet
          }
        } catch (childErr) {
          console.error("Failed to fetch children for parent:", childErr);
          // Fallback to dashboard if children fetch fails
        }
      }

      // Redirect to dashboard (handled by AppUsers sub-router)
      navigate("/user/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      if (!showChildModal) {
        setLoading(false);
      }
    }
  };

  const handleSelectChild = async () => {
    if (!selectedChildId) return;
    const selectedChild = children.find(c => String(c.student_session_id) === String(selectedChildId));
    if (!selectedChild) return;

    setIsSubmittingChild(true);
    try {
      await api_users.updateStudentClass(selectedChild.student_session_id, selectedChild.student_id);
      setShowChildModal(false);
      navigate("/user/dashboard");
    } catch (err) {
      setError("Failed to select child. Please try again.");
      setShowChildModal(false);
    } finally {
      setIsSubmittingChild(false);
    }
  };

  return (
    <div className="login-container">

      {/* LEFT SECTION */}
      <div
        className="login-left"
        style={{
          backgroundImage: "url('/images/user_login_bg.png')",
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
          </div>
        </form>
      </div>

      {/* CHILD SELECTION MODAL */}
      {showChildModal && (
        <div className="child-modal-overlay">
          <div className="child-modal-card">
            <div className="child-modal-header">
              <h3>Select Student</h3>
              <p>Please select a student profile to continue</p>
            </div>

            <div className="child-list">
              {children.map((child) => (
                <div
                  key={child.student_session_id}
                  className={`child-item ${selectedChildId === child.student_session_id ? 'active' : ''}`}
                  onClick={() => setSelectedChildId(child.student_session_id)}
                >
                  <div className="child-avatar">
                    <GraduationCap size={24} />
                  </div>
                  <div className="child-info">
                    <span className="child-name">{child.firstname} {child.lastname}</span>
                    <span className="child-class">{child.class} ({child.section})</span>
                    {child.is_active === 'yes' && <span className="current-badge">Default</span>}
                  </div>
                  <div className="child-select-indicator">
                    <ChevronRight size={20} />
                  </div>
                </div>
              ))}
            </div>

            <div className="child-modal-footer">
              <button
                className="modal-submit-btn"
                onClick={handleSelectChild}
                disabled={isSubmittingChild || !selectedChildId}
              >
                {isSubmittingChild ? (
                  <><Loader2 size={18} className="animate-spin" /> Updating...</>
                ) : (
                  "Update & Continue"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
