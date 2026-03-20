import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext";
import "./css/AuthPages.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, errors } = useAuthContext();

  const handleLogin = async (event) => {
    event.preventDefault();
    login({ email, password });
  };

  return (
    <section className="auth-page">
      <div className="auth-page__shell">
        <div className="auth-card">
          <div className="auth-card__header">
            <p className="auth-card__eyebrow">Laraveller</p>
            <h1>Welcome back</h1>
            <p>Sign in to continue your boat reservations and favorites.</p>
          </div>

          <form className="auth-form" onSubmit={handleLogin}>
            <div className="auth-field">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                autoComplete="email"
              />
              {errors.email && <span className="auth-error">{errors.email[0]}</span>}
            </div>

            <div className="auth-field">
              <div className="auth-field__input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 3.3 20.7 22" />
                      <path d="M9.5 9.8a3 3 0 0 0 4.7 3.7" />
                      <path d="M7.9 6.6A18.8 18.8 0 0 1 12 6c6.4 0 10 6 10 6a16.2 16.2 0 0 1-3.2 4.1" />
                      <path d="M14.1 17.4A18.7 18.7 0 0 1 12 18c-6.4 0-10-6-10-6a16 16 0 0 1 3.2-4.1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="auth-error">{errors.password[0]}</span>}
            </div>

            <button className="auth-button" type="submit">
              Login
            </button>
          </form>

          <div className="auth-card__links">
            <Link to="/forgot-password">Forgot Password?</Link>
            <p>
              Not a member yet? <Link to="/register">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
