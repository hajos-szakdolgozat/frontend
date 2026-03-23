import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { httpClient } from "../../api/axios";
import useFetch from "../../hooks/useFetch";
import "./css/ReservationPage.css";

const ReservationPage = () => {
  const { id } = useParams();
  const {
    fetchedData: reservation,
    loading,
    error,
  } = useFetch(`/api/reservations/mine/${id}`);

  const nights = useMemo(() => {
    if (!reservation?.start_date || !reservation?.end_date) return 0;
    const start = new Date(reservation.start_date);
    const end = new Date(reservation.end_date);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Number.isFinite(diff) && diff > 0 ? diff : 0;
  }, [reservation]);

  const total = useMemo(() => {
    const price = reservation?.boat?.price_per_night || 0;
    return nights * price;
  }, [nights, reservation]);

  const thumbnail =
    reservation?.boat?.boat_images?.find((image) => image.is_thumbnail) ||
    reservation?.boat?.boat_images?.[0];

  const imageUrl = thumbnail?.path
    ? `${httpClient.defaults.baseURL}storage/${thumbnail.path}`
    : null;

  if (loading) {
    return <p className="reservation-page__status">Betöltés...</p>;
  }

  if (error) {
    return <p className="reservation-page__status">{error.message || error}</p>;
  }

  if (!reservation) {
    return <p className="reservation-page__status">Foglalás nem található.</p>;
  }

  return (
    <section className="reservation-page">
      <header className="reservation-page__header">
        <div>
          <h2>{reservation?.boat?.name}</h2>
          <p>
            {reservation.start_date} → {reservation.end_date}
          </p>
        </div>
        <Link className="reservation-page__back" to="/reservations">
          Vissza a foglalásokhoz
        </Link>
      </header>

      <div className="reservation-page__content">
        <div className="reservation-page__media">
          {imageUrl ? (
            <img src={imageUrl} alt={reservation?.boat?.name} />
          ) : (
            <div className="reservation-page__media-placeholder">Nincs kép</div>
          )}
        </div>
        <div className="reservation-page__summary">
          <div>
            <span>Státusz</span>
            <strong
              className={`reservation-page__badge status--${reservation.status}`}
            >
              {reservation.status}
            </strong>
          </div>
          <div>
            <span>Éjszakák</span>
            <strong>{nights}</strong>
          </div>
          <div>
            <span>Ár / éj</span>
            <strong>
              {reservation?.boat?.price_per_night} {reservation?.boat?.currency || "€"}
            </strong>
          </div>
          <div>
            <span>Összesen</span>
            <strong>
              {total} {reservation?.boat?.currency || "€"}
            </strong>
          </div>
        </div>

        <div className="reservation-page__details">
          <div>
            <span>Típus</span>
            <strong>{reservation?.boat?.type}</strong>
          </div>
          <div>
            <span>Évjárat</span>
            <strong>{reservation?.boat?.year_built}</strong>
          </div>
          <div>
            <span>Hossz</span>
            <strong>{reservation?.boat?.length} m</strong>
          </div>
          <div>
            <span>Szélesség</span>
            <strong>{reservation?.boat?.width} m</strong>
          </div>
          <div>
            <span>Merülés</span>
            <strong>{reservation?.boat?.draft} m</strong>
          </div>
        </div>

        <div className="reservation-page__details">
          <div>
            <span>Értékelés</span>
            <strong>
              {reservation?.review ? `${reservation.review.rating}/5` : "Még nincs értékelés"}
            </strong>
          </div>
          {reservation?.review?.comment && (
            <p className="reservation-page__review-text">{reservation.review.comment}</p>
          )}
          {!reservation?.review && (
            <Link className="reservation-page__review-cta" to={`/reservations/${reservation.id}/review`}>
              Értékelés írása
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default ReservationPage;
