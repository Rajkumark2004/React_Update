import React from "react";
import "./LoginPage.css";
import { Mail, Key } from "lucide-react";

export default function ForgotPassword() {
    return (
        <div className="login-container">

            {/* LEFT SECTION */}
            <div
                className="login-left"
                style={{
                    backgroundImage: "url('/Wisibles_BG.png')",
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

                    <button type="submit" className="login-button">
                        Submit
                    </button>

                    <a href="#" className="back-to-login">
                        <Key size={16} /> Admin Login
                    </a>

                </form>
            </div>
        </div >
    );
}
