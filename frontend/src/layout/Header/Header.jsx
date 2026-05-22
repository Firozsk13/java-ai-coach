import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Header.scss";
import { removeUser } from "../../utils/localStorage";

/**
 * Header Component
 * Application header with logo, navigation, and user profile menu
 */
const Header = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const profileRef = useRef(null);

  // Safely fetch user email from localStorage
  let email = "";
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    email = user?.email || "";
  } catch (e) {
    email = "";
  }

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    removeUser();
    navigate("/login");
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* LOGO */}
        <Link to="/default/bot-list" className="brand">
          <div className="brand-logo">
            <span className="logo-dot"></span>
            <span className="logo-core"></span>
          </div>
          <span className="brand-text">JavaAI Coach</span>
        </Link>

        {/* PROFILE */}
        <div className="profile-wrapper" ref={profileRef}>
          {email && <span className="user-email">{email}</span>}

          <div
            className="profile-avatar"
            onClick={() => setOpen((prev) => !prev)}
          >
            👤
          </div>

          {open && (
            <div className="profile-menu">
              <button onClick={() => navigate("/default/bot-list")}>
                Home
              </button>

              <button disabled>Settings</button>

              {/* Dark mode toggle */}
              <label className="theme-toggle">
                <input
                  type="checkbox"
                  onChange={() =>
                    document.body.classList.toggle("dark-mode")
                  }
                />
                <span className="slider"></span>
                Dark Mode
              </label>

              <button className="danger" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
