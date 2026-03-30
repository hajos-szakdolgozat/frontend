import { useMemo, useState } from "react";
import useAuthContext from "../../hooks/useAuthContext";
import useFetch from "../../hooks/useFetch";
import { httpClient } from "../../api/axios";
import fallbackAvatar from "../../images/userimage.png";
import "./css/ProfilePage.css";

const tabs = [
  { key: "reservations", label: "Foglalásaim" },
  { key: "reviews", label: "Értékeléseim" },
  { key: "settings", label: "Beállítások" },
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("reservations");
  const [activeSetting, setActiveSetting] = useState("password");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const { user } = useAuthContext();
  const {
    fetchedData: reservations,
    loading: reservationsLoading,
    error: reservationsError,
  } = useFetch("/api/reservations/mine");

  const avatarSrc = useMemo(() => {
    const hasAvatarPath =
      typeof user?.avatar_path === "string" && user.avatar_path.trim() !== "";

    return hasAvatarPath
      ? new URL(user.avatar_path, httpClient.defaults.baseURL).toString()
      : fallbackAvatar;
  }, [user]);

  const reviews = useMemo(() => {
    if (!Array.isArray(reservations)) {
      return [];
    }

    return reservations
      .filter((reservation) => reservation?.review)
      .map((reservation) => ({
        id: reservation.id,
        boatName: reservation?.boat?.name || "Ismeretlen hajó",
        reviewText: reservation?.review?.comment || "Nincs szöveges értékelés.",
        rating: reservation?.review?.rating,
      }));
  }, [reservations]);

  const settingsContent = {
    password: {
      title: "Jelszócsere",
      description: "Frissítsd a jelszavadat a nagyobb fiókbiztonság érdekében.",
      cta: "Jelszócsere indítása",
    },
    privacy: {
      title: "Adatvédelem",
      description: "Áttekintheted, milyen adatokat kezel a rendszer és hogyan használjuk őket.",
      cta: "Adatvédelmi opciók",
    },
    general: {
      title: "Általános beállítások",
      description: "Fiókodhoz kapcsolódó alapbeállítások, értesítések és preferenciák helye.",
      cta: "Beállítások megnyitása",
    },
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !newPasswordConfirmation) {
      setPasswordError("Minden mező kitöltése kötelező.");
      return;
    }

    if (newPassword !== newPasswordConfirmation) {
      setPasswordError("Az új jelszó és a megerősítés nem egyezik.");
      return;
    }

    setPasswordSubmitting(true);

    try {
      await httpClient.get("/sanctum/csrf-cookie");
      const { data } = await httpClient.put("/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: newPasswordConfirmation,
      });

      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
      setPasswordSuccess(data?.message || "A jelszó módosítása sikeres.");
    } catch (error) {
      const backendErrors = error?.response?.data?.errors;
      const flatErrors = backendErrors ? Object.values(backendErrors).flat().join(" ") : "";
      setPasswordError(flatErrors || "A jelszó módosítása sikertelen.");
    } finally {
      setPasswordSubmitting(false);
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-page__inner">
        <article className="profile-card">
          <header className="profile-card__header">
            <div className="profile-user">
              <img src={avatarSrc} alt="Profilkép" className="profile-user__avatar" />
              <div className="profile-user__meta">
                <p className="profile-user__name">{user?.name || "Felhasználó"}</p>
                <p className="profile-user__email">{user?.email || "Nincs email"}</p>
              </div>
            </div>

            <button type="button" className="profile-edit-btn">
              Profil szerkesztése
            </button>
          </header>

          <div className="profile-tabs" role="tablist" aria-label="Profil szekciók">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                className={`profile-tab ${activeTab === tab.key ? "is-active" : ""}`}
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <section className="profile-content">
            {activeTab === "reservations" && (
              <div className="profile-panel">
                {reservationsLoading ? (
                  <p className="profile-empty">Betöltés...</p>
                ) : reservationsError ? (
                  <p className="profile-empty">Nem sikerült betölteni a foglalásokat.</p>
                ) : Array.isArray(reservations) && reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <article className="profile-list-item" key={reservation.id}>
                      <p>
                        <strong>{reservation?.boat?.name || "Ismeretlen hajó"}</strong> - {" "}
                        {reservation?.start_date || "-"} | Status: {reservation?.status || "-"}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="profile-empty">Még nincs foglalásod.</p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="profile-panel">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <article className="profile-list-item profile-list-item--review" key={review.id}>
                      <p>
                        <strong>{review.boatName}</strong>
                        {typeof review.rating === "number" ? ` | ${review.rating}/5` : ""}
                      </p>
                      <p>{review.reviewText}</p>
                    </article>
                  ))
                ) : (
                  <p className="profile-empty">
                    Jelenleg nincs saját értékelés endpoint a backendben, vagy még nem értékeltél.
                  </p>
                )}
              </div>
            )}

            {activeTab === "settings" && (
              <div className="profile-panel profile-settings-layout">
                <div className="profile-settings-menu">
                  <button
                    type="button"
                    className={`profile-secondary-btn ${activeSetting === "password" ? "is-active" : ""}`}
                    onClick={() => setActiveSetting("password")}
                  >
                    Jelszócsere
                  </button>
                  <button
                    type="button"
                    className={`profile-secondary-btn ${activeSetting === "privacy" ? "is-active" : ""}`}
                    onClick={() => setActiveSetting("privacy")}
                  >
                    Adatvédelem
                  </button>
                  <button
                    type="button"
                    className={`profile-secondary-btn ${activeSetting === "general" ? "is-active" : ""}`}
                    onClick={() => setActiveSetting("general")}
                  >
                    Beállítások
                  </button>
                </div>

                <article className="profile-settings-detail">
                  <h3>{settingsContent[activeSetting].title}</h3>
                  <p>{settingsContent[activeSetting].description}</p>
                  {activeSetting === "password" ? (
                    <form className="auth-form" onSubmit={handlePasswordUpdate}>
                      <div className="auth-field">
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(event) => setCurrentPassword(event.target.value)}
                          placeholder="Jelenlegi jelszó"
                          autoComplete="current-password"
                        />
                      </div>
                      <div className="auth-field">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          placeholder="Új jelszó"
                          autoComplete="new-password"
                        />
                      </div>
                      <div className="auth-field">
                        <input
                          type="password"
                          value={newPasswordConfirmation}
                          onChange={(event) => setNewPasswordConfirmation(event.target.value)}
                          placeholder="Új jelszó megerősítése"
                          autoComplete="new-password"
                        />
                      </div>

                      {passwordError && <p className="profile-empty">{passwordError}</p>}
                      {passwordSuccess && <p className="profile-empty">{passwordSuccess}</p>}

                      <button
                        type="submit"
                        className="profile-settings-cta"
                        disabled={passwordSubmitting}
                      >
                        {passwordSubmitting ? "Mentés..." : "Jelszó módosítása"}
                      </button>
                    </form>
                  ) : (
                    <button type="button" className="profile-settings-cta">
                      {settingsContent[activeSetting].cta}
                    </button>
                  )}
                </article>
              </div>
            )}
          </section>
        </article>
      </div>
    </section>
  );
};

export default ProfilePage;
