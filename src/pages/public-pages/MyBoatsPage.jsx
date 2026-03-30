import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";
import { getBoatImages, resolveBoatImageUrl } from "../../utils/boatImages";
import "./css/MyBoatsPage.css";

const MyBoatsPage = () => {
  const { fetchedData: boats, loading, error } = useFetch("/api/boats/mine", {
    cacheTime: 0,
  });

  if (loading) {
    return <p className="my-boats-page__status">Betöltés...</p>;
  }

  if (error) {
    return <p className="my-boats-page__status">{error}</p>;
  }

  const normalizedBoats = Array.isArray(boats) ? boats : [];

  return (
    <section className="my-boats-page">
      <header className="my-boats-page__header">
        <div>
          <h1>Saját hirdetéseim</h1>
          <p>Itt kezeled az általad létrehozott hajóhirdetéseket.</p>
        </div>
        <Link className="my-boats-page__create" to="/newBoat">
          Új hirdetés
        </Link>
      </header>

      {normalizedBoats.length ? (
        <div className="my-boats-page__grid">
          {normalizedBoats.map((boat) => {
            const boatImages = getBoatImages(boat);
            const thumbnail =
              boatImages.find((image) => image?.is_thumbnail || image?.isThumbnail) ||
              boatImages[0];
            const imageUrl = resolveBoatImageUrl(thumbnail);

            return (
              <article key={boat.id} className="my-boats-card">
                <Link className="my-boats-card__media" to={`/boat/${boat.id}`}>
                  {imageUrl ? (
                    <img src={imageUrl} alt={boat.name} loading="lazy" />
                  ) : (
                    <div className="my-boats-card__placeholder">Nincs kép</div>
                  )}
                  <span
                    className={`my-boats-card__status${boat.is_active ? " is-active" : " is-inactive"}`}
                  >
                    {boat.is_active ? "Aktív" : "Inaktív"}
                  </span>
                </Link>

                <div className="my-boats-card__body">
                  <div>
                    <h2>{boat.name}</h2>
                    <p>
                      {boat?.port?.name || "Ismeretlen kikötő"}
                      {boat?.port?.city ? ` • ${boat.port.city}` : ""}
                    </p>
                  </div>

                  <div className="my-boats-card__meta">
                    <div>
                      <span>Ár / éj</span>
                      <strong>
                        {boat.price_per_night} {boat.currency || "EUR"}
                      </strong>
                    </div>
                    <div>
                      <span>Értékelések</span>
                      <strong>{boat.reviews_count || 0}</strong>
                    </div>
                    <div>
                      <span>Típus</span>
                      <strong>{boat.type}</strong>
                    </div>
                  </div>

                  <div className="my-boats-card__actions">
                    <Link to={`/boat/${boat.id}`}>Megnyitás</Link>
                    <Link to={`/boats/${boat.id}/edit`}>Szerkesztés</Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="my-boats-page__empty">
          <p>Még nincs saját hirdetésed.</p>
          <Link to="/newBoat">Első hirdetés létrehozása</Link>
        </div>
      )}
    </section>
  );
};

export default MyBoatsPage;