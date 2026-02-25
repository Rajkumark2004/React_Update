import React, { useState } from "react";
import "./LoginPage.css";
import { Mail, Key } from "lucide-react";

export default function ForgotPassword() {
    const [userType, setUserType] = useState("student");

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

                <h2>Forgot Password</h2>

                <form className="login-form">
                    <div className="input-group">
                        <div className="input-icon">
                            <Mail size={20} />
                        </div>
                        <input
                            type="text"
                            placeholder="Email"
                            className="login-input"
                        />
                    </div>

                    {/* User Type Selection Radio Buttons */}
                    <div className="user-type-selection" style={{ display: "flex", gap: "20px", marginBottom: "15px", justifyContent: "center" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                            <input
                                type="radio"
                                name="userType"
                                value="student"
                                checked={userType === "student"}
                                onChange={(e) => setUserType(e.target.value)}
                            />
                            Student
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: "5px", cursor: "pointer" }}>
                            <input
                                type="radio"
                                name="userType"
                                value="parent"
                                checked={userType === "parent"}
                                onChange={(e) => setUserType(e.target.value)}
                            />
                            Parent
                        </label>
                    </div>

                    <button type="submit" className="login-button">
                        Submit
                    </button>

                    <a href="/user/login" className="back-to-login">
                        <Key size={16} /> User Login
                    </a>

                </form>
            </div>
        </div >
    );
}
