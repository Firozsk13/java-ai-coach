import React, { useState } from "react";
import "./Register.scss";
import { Link, useNavigate } from "react-router-dom";
import ApiService from "../../services/Api.service";
import { toast } from "react-toastify";

const Register = () => {
  let navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_number: "",
    company_name: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone_number, company_name, password } = formData;

    if (!name || !email || !phone_number || !company_name || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!/^[0-9]{10}$/.test(phone_number)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);

    let { data, error } = await ApiService.register(formData);

    setLoading(false);

    if (error) {
      toast.error(error.response.data.error);
      return;
    }

    if (data) {
      toast.success(data.message);
      navigate("/login");
    }
  };

  return (
    <div className="register-page">
      {/* NAVBAR */}
      <header className="register-header">
        <div className="header-inner">
          <div className="brand">
            <div className="brand-logo">
              <span className="logo-dot"></span>
              <span className="logo-core"></span>
            </div>
            <span className="brand-text">JavaAI Coach</span>
          </div>

          <nav className="nav-links">
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/register" className="nav-btn active">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="auth-page">
        <div className="auth-container reverse">
          {/* LEFT CARD */}
          <div className="auth-card">
            <h2>Create Your Account</h2>
            <p className="subtitle">Join us and start learning Java</p>

            <form onSubmit={handleSubmit}>
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
              />

              <label>Phone</label>
              <input
                type="tel"
                name="phone_number"
                placeholder="Enter your phone number"
                value={formData.phone_number}
                onChange={handleChange}
              />

              <label>Company</label>
              <input
                type="text"
                name="company_name"
                placeholder="Enter your company name"
                value={formData.company_name}
                onChange={handleChange}
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />

              <button type="submit" disabled={loading}>
                {loading ? "Registering..." : "Create Account"}
              </button>

              <p className="footer-text">
                Already have an account?{" "}
                <Link to="/login">Login here</Link>
              </p>
            </form>
          </div>

          {/* RIGHT CONTENT */}
          <div className="auth-left floating">
            <h1>
              Start Java <br />
              <span>with confidence</span>
            </h1>
            <p>
              Learn Java with AI-powered guidance, clean explanations, and
              real-world examples designed for you.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="register-footer">
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

export default Register;
