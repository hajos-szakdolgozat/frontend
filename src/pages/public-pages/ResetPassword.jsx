import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { httpClient } from "../../api/axios";
import PasswordField from "../../components/auth/PasswordField";
import "./css/AuthPages.css";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = searchParams.get("token") || "";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Hiányzik a visszaállító token az URL-ből.");
      return;
    }

    setSubmitting(true);

    try {
      await httpClient.get("/sanctum/csrf-cookie");
      const { data } = await httpClient.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setStatusMessage(data?.status || "A jelszó sikeresen módosítva.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      const errors = error?.response?.data?.errors;
      const flatErrors = errors ? Object.values(errors).flat().join(" ") : "";
      setErrorMessage(flatErrors || "A jelszó visszaállítása sikertelen.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-page__shell">
        <div className="auth-card">
          <div className="auth-card__header">
            <h1>Új jelszó beállítása</h1>
            <p>Add meg az email címedet és az új jelszót.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                autoComplete="email"
                required
              />
            </div>

            <PasswordField
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Új jelszó"
              autoComplete="new-password"
            />

            <PasswordField
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
              placeholder="Új jelszó megerősítése"
              autoComplete="new-password"
            />

            {statusMessage && <span className="auth-success">{statusMessage}</span>}
            {errorMessage && <span className="auth-error">{errorMessage}</span>}

            <button className="auth-button" type="submit" disabled={submitting}>
              {submitting ? "Mentés..." : "Jelszó visszaállítása"}
            </button>
          </form>

          <div className="auth-card__links">
            <p>
              Vissza a bejelentkezéshez: <Link to="/login">Belépés</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResetPassword;
