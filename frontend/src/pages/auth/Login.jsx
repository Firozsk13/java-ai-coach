import React, { useState } from "react";
import "./Login.scss";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ApiService from "../../services/Api.service";


const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  let navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    let { data, error } = await ApiService.login(formData);

    setLoading(false);

    if (error) {
      toast.error(error.response.data.message);
      return;
    }

    if (data) {
      toast.success(data.message);
      navigate("/default");
    }
  };

  return (
    <div className="login-page">
      {/* NAVBAR */}
      <header className="login-header">
        <div className="header-inner">
      
          <div className="brand">
            <div className="brand-logo">
            <span className="logo-dot"></span>
            <span className="logo-core"></span>
          </div>
          <span className="brand-text">JavaAI Coach</span>
        </div>


          <nav className="nav-links">
            <Link to="/login" className="nav-link active">
              Login
            </Link>
            <Link to="/register" className="nav-btn">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="auth-page">
        <div className="auth-container">
          {/* LEFT */}
          <div className="auth-left floating">
            <h1>
              Learn Java <br />
              <span>the smart way</span>
            </h1>
            <p>
              Your personal AI-powered Java learning assistant. <br /> Clear concepts,
              real examples, focused learning.
            </p>
          </div>

          {/* RIGHT CARD */}
          <div className="auth-card">
            <h2>Welcome Back</h2>
            <p className="subtitle">Sign in to continue</p>

            <form onSubmit={handleSubmit}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="footer-text">
                Don’t have an account?{" "}
                <Link to="/register">Sign Up</Link>
              </p>
            </form>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="login-footer">
        <div className="footer-inner">
          <p>© 2025 JavaAI Coach. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
