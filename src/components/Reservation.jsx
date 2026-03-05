import "./css/Reservation.css";

const Reservation = ({ reservation }) => {
  const boatName = reservation?.boat?.name || "Ismeretlen hajó";
  const status = reservation?.status || "ismeretlen";
  const pricePerNight = reservation?.boat?.price_per_night || 0;
  const currency = reservation?.boat?.currency || "€";

  const nights = (() => {
    if (!reservation?.start_date || !reservation?.end_date) return 0;
    const start = new Date(reservation.start_date);
    const end = new Date(reservation.end_date);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return Number.isFinite(diff) && diff > 0 ? diff : 0;
  })();

  const total = nights * pricePerNight;

  return (
    <article className="reservation-row">
      <div className="reservation-row__main">
        <h3>{boatName}</h3>
        <p>
          {reservation?.start_date} → {reservation?.end_date}
        </p>
      </div>

      <div className="reservation-row__meta">
        <div>
          <span>Ár / éj</span>
          <strong>{pricePerNight} {currency}</strong>
        </div>
        <div>
          <span>Típus</span>
          <strong>{reservation?.boat?.type}</strong>
        </div>
        <div>
          <span>Összesen</span>
          <strong>{total} {currency}</strong>
        </div>
      </div>

      <span className={`reservation-row__status status--${status}`}>
        {status}
      </span>
    </article>
  );
};

export default Reservation;
