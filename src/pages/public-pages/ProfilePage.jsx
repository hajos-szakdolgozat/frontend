import { useMemo, useState } from "react";
import useAuthContext from "../../hooks/useAuthContext";
import useFetch from "../../hooks/useFetch";
import { httpClient } from "../../api/axios";
import fallbackAvatar from "../../images/userimage.png";
import "./css/ProfilePage.css";

const tabs = [
  { key: "reservations", label: "Foglalasaim" },
  { key: "reviews", label: "Ertekeleseim" },
  { key: "settings", label: "Beallitasok" },
];

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("reservations");
  const [activeSetting, setActiveSetting] = useState("password");
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
        boatName: reservation?.boat?.name || "Ismeretlen hajo",
        reviewText: reservation?.review?.comment || "Nincs szoveges ertekeles.",
        rating: reservation?.review?.rating,
      }));
  }, [reservations]);

  const settingsContent = {
    password: {
      title: "Jelszocsere",
      description: "Frissitsd a jelszavadat a nagyobb fiokbiztonsag erdekeben.",
      cta: "Jelszocsere inditasa",
    },
    privacy: {
      title: "Adatvedelem",
      description: "Attekintheted, milyen adatokat kezel a rendszer es hogyan hasznaljuk oket.",
      cta: "Adatvedelmi opciok",
    },
    general: {
      title: "Altalanos beallitasok",
      description: "Fiokodhoz kapcsolodo alapbeallitasok, ertesitesek es preferenciak helye.",
      cta: "Beallitasok megnyitasa",
    },
  };

  return (
    <section className="profile-page">
      <div className="profile-page__inner">
        <article className="profile-card">
          <header className="profile-card__header">
            <div className="profile-user">
              <img src={avatarSrc} alt="Profilkep" className="profile-user__avatar" />
              <div className="profile-user__meta">
                <p className="profile-user__name">{user?.name || "Felhasznalo"}</p>
                <p className="profile-user__email">{user?.email || "Nincs email"}</p>
              </div>
            </div>

            <button type="button" className="profile-edit-btn">
              Profil szerkesztese
            </button>
          </header>

          <div className="profile-tabs" role="tablist" aria-label="Profil szekciok">
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
                  <p className="profile-empty">Betoltes...</p>
                ) : reservationsError ? (
                  <p className="profile-empty">Nem sikerult betolteni a foglalasokat.</p>
                ) : Array.isArray(reservations) && reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <article className="profile-list-item" key={reservation.id}>
                      <p>
                        <strong>{reservation?.boat?.name || "Ismeretlen hajo"}</strong> - {" "}
                        {reservation?.start_date || "-"} | Status: {reservation?.status || "-"}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="profile-empty">Meg nincs foglalasod.</p>
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
                    Jelenleg nincs sajat ertekeles endpoint a backendben, vagy meg nem ertekeltel.
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
                    Jelszocsere
                  </button>
                  <button
                    type="button"
                    className={`profile-secondary-btn ${activeSetting === "privacy" ? "is-active" : ""}`}
                    onClick={() => setActiveSetting("privacy")}
                  >
                    Adatvedelem
                  </button>
                  <button
                    type="button"
                    className={`profile-secondary-btn ${activeSetting === "general" ? "is-active" : ""}`}
                    onClick={() => setActiveSetting("general")}
                  >
                    Beallitasok
                  </button>
                </div>

                <article className="profile-settings-detail">
                  <h3>{settingsContent[activeSetting].title}</h3>
                  <p>{settingsContent[activeSetting].description}</p>
                  <button type="button" className="profile-settings-cta">
                    {settingsContent[activeSetting].cta}
                  </button>
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
