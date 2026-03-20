import { useState } from "react";
import { Link } from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext";
import "./css/AuthPages.css";

const Register = () => {
  const [name, setName] = useState("");
  // const [lastname, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(0);
  const [password_confirmation, setPassword_confirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const { register, errors } = useAuthContext();

  const handleRegister = async (event) => {
    event.preventDefault();
    register({
      name,
      email,
      phone_number: phoneNumber,
      password,
      password_confirmation,
    });
  };

  return (
    <section className="auth-page">
      <div className="auth-page__shell">
        <div className="auth-card">
          <div className="auth-card__header">
            <p className="auth-card__eyebrow">Laraveller</p>
            <h1>Create account</h1>
            <p>Join now to manage bookings and keep your favorite boats close.</p>
          </div>

          <form className="auth-form" onSubmit={handleRegister}>
            <div className="auth-field">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="First Name"
                autoComplete="name"
              />
              {errors.name && <span className="auth-error">{errors.name[0]}</span>}
            </div>

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
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Telefonszam"
                autoComplete="tel"
              />
              {errors.phone_number && <span className="auth-error">{errors.phone_number[0]}</span>}
            </div>

            <div className="auth-field">
              <div className="auth-field__input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoComplete="new-password"
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

            <div className="auth-field">
              <div className="auth-field__input-wrap">
                <input
                  type={showPasswordConfirmation ? "text" : "password"}
                  value={password_confirmation}
                  onChange={(e) => setPassword_confirmation(e.target.value)}
                  placeholder="Password Confirmation"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowPasswordConfirmation((prev) => !prev)}
                  aria-label={showPasswordConfirmation ? "Hide password confirmation" : "Show password confirmation"}
                >
                  {showPasswordConfirmation ? (
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
              {errors.password_confirmation && (
                <span className="auth-error">{errors.password_confirmation[0]}</span>
              )}
            </div>

            <button className="auth-button" type="submit">
              Register
            </button>
          </form>

          <div className="auth-card__links">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
