import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { httpClient } from "../../api/axios";
import useFetch from "../../hooks/useFetch";
import "./css/ReviewCreatePage.css";

const ReviewCreatePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    fetchedData: reservation,
    loading,
    error,
  } = useFetch(`/api/reservations/mine/${id}`);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const hasExistingReview = Boolean(reservation?.review);

  const boatId = useMemo(() => {
    return reservation?.boat_id || reservation?.boat?.id || null;
  }, [reservation]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");

    if (!boatId) {
      setSubmitError("Nem található a hajó az értékeléshez.");
      return;
    }

    if (!comment.trim()) {
      setSubmitError("Az értékelés szövege nem lehet üres.");
      return;
    }

    if (comment.trim().length < 10) {
      setSubmitError("Kérlek írj legalább 10 karaktert.");
      return;
    }

    setSubmitting(true);
    try {
      await httpClient.post("/api/reviews", {
        reservation_id: Number(id),
        boat_id: boatId,
        rating,
        comment: comment.trim(),
      });

      navigate(`/boat/${boatId}`);
    } catch (submitErr) {
      const backendMessage = submitErr?.response?.data?.message;
      const fieldMessage = Object.values(submitErr?.response?.data?.errors || {})?.[0]?.[0];
      setSubmitError(backendMessage || fieldMessage || "Az értékelés mentése sikertelen.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="review-page__status">Betöltés...</p>;
  }

  if (error) {
    return <p className="review-page__status">{error.message || error}</p>;
  }

  if (!reservation) {
    return <p className="review-page__status">Foglalás nem található.</p>;
  }

  return (
    <section className="review-page">
      <header className="review-page__header">
        <div>
          <h1>Hajó értékelése</h1>
          <p>
            {reservation?.boat?.name || "Ismeretlen hajó"} | {reservation?.start_date} - {reservation?.end_date}
          </p>
        </div>
        <Link to="/reservations" className="review-page__back">
          Vissza a foglalásokhoz
        </Link>
      </header>

      {hasExistingReview ? (
        <article className="review-page__card">
          <h2>Már értékelted ezt a foglalást</h2>
          <p>
            Értékelés: <strong>{reservation.review.rating}/5</strong>
          </p>
          <p>{reservation.review.comment}</p>
          {boatId && (
            <Link className="review-page__cta" to={`/boat/${boatId}`}>
              Ugrás a hirdetéshez
            </Link>
          )}
        </article>
      ) : (
        <form className="review-page__card" onSubmit={handleSubmit}>
          <h2>Vélemény írása</h2>

          <div className="review-page__stars" role="radiogroup" aria-label="Értékelés csillagokkal">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={value <= rating ? "review-star is-active" : "review-star"}
                onClick={() => setRating(value)}
                aria-label={`${value} csillag`}
              >
                ★
              </button>
            ))}
            <span className="review-page__rating-label">{rating}/5</span>
          </div>

          <label htmlFor="review-comment">Szöveges vélemény</label>
          <textarea
            id="review-comment"
            rows={6}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Milyen volt a hajó, a kommunikáció és az összélmény?"
          />

          {submitError && <p className="review-page__error">{submitError}</p>}

          <button className="review-page__submit" type="submit" disabled={submitting}>
            {submitting ? "Mentés..." : "Értékelés mentése"}
          </button>
        </form>
      )}
    </section>
  );
};

export default ReviewCreatePage;
