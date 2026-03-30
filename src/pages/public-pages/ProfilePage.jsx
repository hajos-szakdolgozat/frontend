import { useEffect, useMemo, useState } from "react";
import useAuthContext from "../../hooks/useAuthContext";
import useFetch from "../../hooks/useFetch";
import { httpClient } from "../../api/axios";
import fallbackAvatar from "../../images/userimage.png";
import { resolveAvatarUrl } from "../../utils/avatarImage";
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
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const { user, getUser } = useAuthContext();
  const {
    fetchedData: reservations,
    loading: reservationsLoading,
    error: reservationsError,
  } = useFetch("/api/reservations/mine");

  const avatarSrc = useMemo(() => {
    if (avatarLoadFailed) return fallbackAvatar;
    return resolveAvatarUrl(user?.avatar_path, fallbackAvatar);
  }, [user?.avatar_path, avatarLoadFailed]);

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

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
    });
    setAvatarLoadFailed(false);
    setAvatarFile(null);
    setAvatarPreview("");
    setRemoveAvatar(false);
  }, [user?.name, user?.email, user?.phone_number, user?.avatar_path]);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

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

  const handleProfileInputChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setProfileError("Csak képfájl tölthető fel profilképnek.");
      return;
    }

    setAvatarFile(file);
    setRemoveAvatar(false);
    setAvatarPreview(URL.createObjectURL(file));
    setProfileError("");
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("name", profileForm.name);
      payload.append("email", profileForm.email);
      payload.append("phone_number", profileForm.phone_number);
      payload.append("remove_avatar", removeAvatar ? "1" : "0");

      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      await httpClient.get("/sanctum/csrf-cookie");
      await httpClient.post("/api/me", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      await getUser();
      setProfileSuccess("A profil adatai sikeresen frissültek.");
      setAvatarFile(null);
      setAvatarPreview("");
      setRemoveAvatar(false);
    } catch (error) {
      const backendErrors = error?.response?.data?.errors;
      const flatErrors = backendErrors ? Object.values(backendErrors).flat().join(" ") : "";
      setProfileError(flatErrors || "A profil mentése sikertelen.");
    } finally {
      setProfileSubmitting(false);
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-page__inner">
        <article className="profile-card">
          <header className="profile-card__header">
            <div className="profile-user">
              <img
                src={avatarSrc}
                alt="Profilkép"
                className="profile-user__avatar"
                onError={() => setAvatarLoadFailed(true)}
              />
              <div className="profile-user__meta">
                <p className="profile-user__name">{user?.name || "Felhasználó"}</p>
                <p className="profile-user__email">{user?.email || "Nincs email"}</p>
              </div>
            </div>

            <button
              type="button"
              className="profile-edit-btn"
              onClick={() => {
                setActiveTab("settings");
                setActiveSetting("general");
              }}
            >
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
                  ) : activeSetting === "general" ? (
                    <form className="auth-form" onSubmit={handleProfileSave}>
                      <div className="auth-field">
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileInputChange}
                          placeholder="Név"
                          autoComplete="name"
                          required
                        />
                      </div>

                      <div className="auth-field">
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileInputChange}
                          placeholder="Email"
                          autoComplete="email"
                          required
                        />
                      </div>

                      <div className="auth-field">
                        <input
                          type="text"
                          name="phone_number"
                          value={profileForm.phone_number}
                          onChange={handleProfileInputChange}
                          placeholder="Telefonszám"
                          autoComplete="tel"
                          required
                        />
                      </div>

                      <div className="profile-avatar-edit">
                        <img
                          src={avatarPreview || avatarSrc}
                          alt="Profilkép előnézet"
                          className="profile-avatar-edit__preview"
                          onError={() => setAvatarLoadFailed(true)}
                        />
                        <div className="profile-avatar-edit__controls">
                          <input type="file" accept="image/*" onChange={handleAvatarChange} />
                          <label className="profile-avatar-edit__remove">
                            <input
                              type="checkbox"
                              checked={removeAvatar}
                              onChange={(event) => setRemoveAvatar(event.target.checked)}
                            />
                            Profilkép törlése
                          </label>
                        </div>
                      </div>

                      {profileError && <p className="profile-empty">{profileError}</p>}
                      {profileSuccess && <p className="profile-empty">{profileSuccess}</p>}

                      <button
                        type="submit"
                        className="profile-settings-cta"
                        disabled={profileSubmitting}
                      >
                        {profileSubmitting ? "Mentés..." : "Profil mentése"}
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
