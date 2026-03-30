import { useState } from "react";
import { Link } from "react-router-dom";
import { httpClient } from "../../api/axios";
import "./css/AuthPages.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    setErrorMessage("");
    setSubmitting(true);

    try {
      await httpClient.get("/sanctum/csrf-cookie");
      const { data } = await httpClient.post("/forgot-password", { email });
      setStatusMessage(
        data?.status || "Ha létezik ilyen email cím, elküldtük a jelszó-visszaállító linket.",
      );
    } catch (error) {
      const errors = error?.response?.data?.errors;
      const flatErrors = errors ? Object.values(errors).flat().join(" ") : "";
      setErrorMessage(flatErrors || "Nem sikerült elküldeni a visszaállító linket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-page__shell">
        <div className="auth-card">
          <div className="auth-card__header">
            <h1>Elfelejtett jelszó</h1>
            <p>Add meg az email címedet, és küldünk egy visszaállító linket.</p>
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

            {statusMessage && <span className="auth-success">{statusMessage}</span>}
            {errorMessage && <span className="auth-error">{errorMessage}</span>}

            <button className="auth-button" type="submit" disabled={submitting}>
              {submitting ? "Küldés..." : "Visszaállító link küldése"}
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

export default ForgotPassword;
