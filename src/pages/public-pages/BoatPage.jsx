import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import ReservationFrom from "../../components/ReservationFrom";
import "./css/BoatPage.css";
import useFetch, { invalidateFetchCache } from "../../hooks/useFetch";
import useAuthContext from "../../hooks/useAuthContext";
import { getBoatImages, resolveBoatImageUrl } from "../../utils/boatImages";
import { httpClient } from "../../api/axios";
import fallbackAvatar from "../../images/userimage.png";

function BoatPage() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { fetchedData: boat, loading, error } = useFetch(`/api/boats/${id}`);
  const {
    fetchedData: reviewsResponse,
    loading: reviewsLoading,
    error: reviewsError,
  } = useFetch(`/api/boats/${id}/reviews`, { cacheTime: 0 });

  const [pageImageIndex, setPageImageIndex] = useState(0);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isOwnerExpanded, setIsOwnerExpanded] = useState(false);
  const [brokenUrls, setBrokenUrls] = useState([]);
  const [localReviews, setLocalReviews] = useState([]);
  const [eligibleReservations, setEligibleReservations] = useState([]);
  const [selectedReservationId, setSelectedReservationId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitError, setReviewSubmitError] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const reviews = useMemo(() => {
    if (Array.isArray(reviewsResponse)) return reviewsResponse;
    if (Array.isArray(reviewsResponse?.reviews)) return reviewsResponse.reviews;
    if (Array.isArray(reviewsResponse?.data)) return reviewsResponse.data;
    return [];
  }, [reviewsResponse]);

  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  const reviewSummary = useMemo(() => {
    if (!localReviews.length) return { count: 0, average: null };
    const total = localReviews.reduce(
      (sum, item) => sum + Number(item?.rating || 0),
      0,
    );
    return {
      count: localReviews.length,
      average: (total / localReviews.length).toFixed(1),
    };
  }, [localReviews]);

  const approvedReservations = useMemo(() => {
    if (Array.isArray(boat?.reservations)) return boat.reservations;
    if (Array.isArray(boat?.approved_reservations))
      return boat.approved_reservations;
    if (Array.isArray(boat?.data?.reservations)) return boat.data.reservations;
    return [];
  }, [boat]);

  const amenityNames = useMemo(() => {
    const boatAmenities = Array.isArray(boat?.boatAmenities)
      ? boat.boatAmenities
      : Array.isArray(boat?.boat_amenities)
        ? boat.boat_amenities
        : [];

    const names = boatAmenities
      .map((item) => item?.amenity?.name || item?.name || "")
      .map((name) => String(name).trim())
      .filter(Boolean);

    return [...new Set(names)];
  }, [boat]);

  const isBoatActive = useMemo(() => {
    const activeFlag = boat?.is_active ?? boat?.active ?? boat?.status;
    if (typeof activeFlag === "string") {
      return !["inactive", "archived", "disabled", "0"].includes(
        activeFlag.toLowerCase(),
      );
    }
    return activeFlag !== false && activeFlag !== 0;
  }, [boat]);

  const owner = boat?.user || {};
  const ownerAvatar = owner?.avatar_path
    ? new URL(owner.avatar_path, httpClient.defaults.baseURL).toString()
    : fallbackAvatar;

  useEffect(() => {
    if (!user || !id) {
      setEligibleReservations([]);
      setSelectedReservationId("");
      return;
    }

    let cancelled = false;

    const loadEligibleReservations = async () => {
      try {
        const { data } = await httpClient.get("/api/reservations/mine");
        if (cancelled) return;
        const reservations = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : [];
        const filtered = reservations.filter((reservation) => {
          const reservationBoatId =
            reservation?.boat_id || reservation?.boat?.id;
          const hasReview = Boolean(
            reservation?.review?.id || reservation?.review?.comment,
          );
          return Number(reservationBoatId) === Number(id) && !hasReview;
        });

        setEligibleReservations(filtered);
        setSelectedReservationId((prev) => {
          if (
            prev &&
            filtered.some((item) => String(item.id) === String(prev))
          ) {
            return prev;
          }
          return filtered[0] ? String(filtered[0].id) : "";
        });
      } catch {
        if (!cancelled) {
          setEligibleReservations([]);
          setSelectedReservationId("");
        }
      }
    };

    setEligibleReservations([]);
    setSelectedReservationId("");
    loadEligibleReservations();

    return () => {
      cancelled = true;
    };
  }, [user, id]);

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewSubmitError("");

    if (!selectedReservationId) {
      setReviewSubmitError("Válassz foglalást az értékeléshez.");
      return;
    }

    if (!reviewComment.trim()) {
      setReviewSubmitError("Az értékelés szövege nem lehet üres.");
      return;
    }

    if (reviewComment.trim().length < 10) {
      setReviewSubmitError("Kérlek írj legalább 10 karaktert.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const { data } = await httpClient.post("/api/reviews", {
        reservation_id: Number(selectedReservationId),
        boat_id: Number(boat.id),
        rating: Number(reviewRating),
        comment: reviewComment.trim(),
      });

      const createdReview = data?.review || data?.data || data;
      const normalizedReview = {
        id: createdReview?.id || Date.now(),
        rating: Number(createdReview?.rating ?? reviewRating),
        comment: createdReview?.comment ?? reviewComment.trim(),
        created_at: createdReview?.created_at || new Date().toISOString(),
        user: createdReview?.user || { name: user?.name || "Te" },
      };

      setLocalReviews((prev) => [normalizedReview, ...prev]);
      setEligibleReservations((prev) =>
        prev.filter(
          (reservation) =>
            String(reservation.id) !== String(selectedReservationId),
        ),
      );

      invalidateFetchCache(`/api/boats/${id}/reviews`);
      invalidateFetchCache("/api/reservations/mine");

      setSelectedReservationId("");
      setReviewRating(5);
      setReviewComment("");
    } catch (submitError) {
      const backendMessage = submitError?.response?.data?.message;
      const fieldMessage = Object.values(
        submitError?.response?.data?.errors || {},
      )?.[0]?.[0];
      setReviewSubmitError(
        backendMessage || fieldMessage || "Az értékelés mentése sikertelen.",
      );
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const imageUrls = useMemo(() => {
    const rawImages = getBoatImages(boat)
      .map((image) => ({
        url: resolveBoatImageUrl(image),
        isThumbnail: Boolean(image?.is_thumbnail || image?.isThumbnail),
      }))
      .filter((item) => Boolean(item.url));

    const thumbnailPos = rawImages.findIndex((item) => item.isThumbnail);
    if (thumbnailPos > 0) {
      const [thumb] = rawImages.splice(thumbnailPos, 1);
      rawImages.unshift(thumb);
    }

    return rawImages.map((item) => item.url);
  }, [boat]);

  const visibleImageUrls = useMemo(() => {
    return imageUrls.filter((url) => !brokenUrls.includes(url));
  }, [imageUrls, brokenUrls]);

  const portLocationLabel = useMemo(() => {
    const parts = [
      boat?.port?.name,
      boat?.port?.city,
      boat?.port?.country,
      boat?.port?.country_name,
      boat?.port?.countryName,
    ]
      .map((part) => String(part || "").trim())
      .filter(Boolean);
    return Array.from(new Set(parts)).join(", ");
  }, [
    boat?.port?.name,
    boat?.port?.city,
    boat?.port?.country,
    boat?.port?.country_name,
    boat?.port?.countryName,
  ]);

  const mapLocationLabel = useMemo(() => {
    const city = String(boat?.port?.city || "").trim();
    const country = String(
      boat?.port?.country ||
        boat?.port?.country_name ||
        boat?.port?.countryName ||
        "",
    ).trim();

    if (city && country) return `${city}, ${country}`;
    if (city) return city;
    if (country) return country;
    return portLocationLabel;
  }, [
    boat?.port?.city,
    boat?.port?.country,
    boat?.port?.country_name,
    boat?.port?.countryName,
    portLocationLabel,
  ]);

  const portCoordinates = useMemo(() => {
    const latRaw =
      boat?.port?.latitude ??
      boat?.port?.lat ??
      boat?.port?.y ??
      boat?.port?.geo_lat ??
      null;
    const lngRaw =
      boat?.port?.longitude ??
      boat?.port?.lng ??
      boat?.port?.lon ??
      boat?.port?.x ??
      boat?.port?.geo_lng ??
      null;

    const lat = Number(latRaw);
    const lng = Number(lngRaw);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    return { lat, lng };
  }, [boat?.port]);

  const mapQuery = useMemo(() => {
    if (portCoordinates) {
      return `${portCoordinates.lat},${portCoordinates.lng}`;
    }
    return portLocationLabel;
  }, [portCoordinates, portLocationLabel]);

  const googleMapsEmbedUrl = useMemo(() => {
    if (!mapQuery) return null;
    // Use `q` so Google renders a real map marker tied to the location.
    return `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`;
  }, [mapQuery]);

  const googleMapsPageUrl = useMemo(() => {
    if (!mapQuery) return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
  }, [mapQuery]);

  useEffect(() => {
    setPageImageIndex(0);
    setLightboxImageIndex(0);
    setIsLightboxOpen(false);
    setBrokenUrls([]);
  }, [id, imageUrls.length]);

  useEffect(() => {
    if (pageImageIndex >= visibleImageUrls.length) {
      setPageImageIndex(0);
    }
    if (lightboxImageIndex >= visibleImageUrls.length) {
      setLightboxImageIndex(0);
    }
  }, [visibleImageUrls.length, pageImageIndex, lightboxImageIndex]);

  const markUrlAsBroken = (url) => {
    if (!url) return;
    setBrokenUrls((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const galleryImages = visibleImageUrls.slice(0, 4).map((url, idx) => ({
    url,
    index: idx,
  }));

  const pageMainImage =
    galleryImages.find((item) => item.index === pageImageIndex) ||
    galleryImages[0] ||
    null;
  const sideImages = galleryImages.filter(
    (item) => item.index !== pageMainImage?.index,
  );

  const openLightboxAt = (index) => {
    if (!visibleImageUrls.length) return;
    setLightboxImageIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => setIsLightboxOpen(false);

  const showPreviousImage = () => {
    if (!visibleImageUrls.length) return;
    setLightboxImageIndex(
      (prev) => (prev - 1 + visibleImageUrls.length) % visibleImageUrls.length,
    );
  };

  const showNextImage = () => {
    if (!visibleImageUrls.length) return;
    setLightboxImageIndex((prev) => (prev + 1) % visibleImageUrls.length);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!isLightboxOpen) return;
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }
      if (event.key === "ArrowLeft" && visibleImageUrls.length) {
        setLightboxImageIndex(
          (prev) =>
            (prev - 1 + visibleImageUrls.length) % visibleImageUrls.length,
        );
      }
      if (event.key === "ArrowRight" && visibleImageUrls.length) {
        setLightboxImageIndex((prev) => (prev + 1) % visibleImageUrls.length);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, visibleImageUrls.length]);

  if (loading) {
    return <p className="boat-page__status">Betöltés...</p>;
  }

  if (error) {
    return <p className="boat-page__status">{error}</p>;
  }

  if (!boat) {
    return <p className="boat-page__status">Hajó nem található.</p>;
  }

  const ownerId = Number(boat?.user_id || boat?.user?.id || 0);
  const currentUserId = Number(user?.id || 0);
  const canEditBoat = Boolean(
    user && (ownerId === currentUserId || user?.role === "admin"),
  );

  return (
    <section className="boat-page">
      <header className="boat-page__header">
        <div>
          <h1>{boat.name}</h1>
          <p className="boat-page__subtitle">
            {boat?.port?.name} • {boat?.port?.city}
          </p>
        </div>
        <div className="boat-page__header-actions">
          {canEditBoat && (
            <Link className="boat-page__back" to={`/boats/${boat.id}/edit`}>
              Hirdetés szerkesztése
            </Link>
          )}
          <Link className="boat-page__back" to="/">
            Vissza a listához
          </Link>
        </div>
      </header>

      <div className="boat-page__content">
        <section className="boat-page__gallery" aria-label="Hajó képek">
          {pageMainImage?.url ? (
            <button
              type="button"
              className="boat-page__gallery-main"
              onClick={() => setPageImageIndex(pageMainImage.index)}
              aria-label="Fő kép"
            >
              <img
                src={pageMainImage.url}
                alt={boat.name}
                onError={() => markUrlAsBroken(pageMainImage.url)}
              />
            </button>
          ) : (
            <div className="boat-page__media-placeholder">Nincs kép</div>
          )}

          <aside className="boat-page__gallery-side">
            {sideImages.length ? (
              sideImages.map((item, idx) => (
                <button
                  key={`${item.url}-${idx}`}
                  type="button"
                  className="boat-page__gallery-tile"
                  onClick={() => setPageImageIndex(item.index)}
                >
                  <img
                    src={item.url}
                    alt={`${boat.name} - kép ${idx + 1}`}
                    onError={() => markUrlAsBroken(item.url)}
                  />
                </button>
              ))
            ) : (
              <div className="boat-page__media-placeholder">Nincs kép</div>
            )}
          </aside>

          {visibleImageUrls.length > 1 && (
            <button
              type="button"
              className="boat-page__show-all"
              onClick={() => openLightboxAt(pageMainImage?.index ?? 0)}
            >
              Az összes fénykép megjelenítése
            </button>
          )}
        </section>

        <div className="boat-page__details">
          <div className="boat-page__badge">{boat.type}</div>
          <p className="boat-page__description">
            {boat.description || "Nincs megadott leírás."}
          </p>

          <div className="boat-page__stats">
            <div>
              <span>Ár / éj</span>
              <strong>
                {boat.price_per_night} {boat.currency || "EUR"}
              </strong>
            </div>
            <div>
              <span>Évjárat</span>
              <strong>{boat.year_built}</strong>
            </div>
            <div>
              <span>Hossz</span>
              <strong>{boat.length} m</strong>
            </div>
            <div>
              <span>Szélesség</span>
              <strong>{boat.width} m</strong>
            </div>
            <div>
              <span>Merülés</span>
              <strong>{boat.draft} m</strong>
            </div>
            <div>
              <span>Kapcsolattartó</span>
              <strong>{boat?.user?.name}</strong>
            </div>
          </div>

          <section
            className="boat-page__amenities"
            aria-label="Felszereltségek"
          >
            <h2>Felszereltségek</h2>
            {amenityNames.length ? (
              <ul className="boat-page__amenities-list">
                {amenityNames.map((amenityName) => (
                  <li key={amenityName} className="boat-page__amenity-item">
                    {amenityName}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="boat-page__amenities-empty">
                Ennél a hirdetésnél nincs megadva felszereltség.
              </p>
            )}
          </section>
        </div>

        {user ? (
          <ReservationFrom
            boatId={id}
            isBoatActive={isBoatActive}
            unavailableRanges={approvedReservations}
          />
        ) : (
          <div className="boat-page__details">
            <p className="boat-page__description">
              Foglaláshoz be kell jelentkezned.
            </p>
            <Link className="boat-page__back" to="/login">
              Bejelentkezés
            </Link>
          </div>
        )}
      </div>

      <section className="boat-page__map" aria-label="Kikötő helyszín térkép">
        <div className="boat-page__map-header">
          <h2>Itt leszel</h2>
          <p>{mapLocationLabel || "Nincs elég adat a kikötő helyszínéhez."}</p>
        </div>

        {googleMapsEmbedUrl ? (
          <>
            <div className="boat-page__map-frame-wrap">
              <iframe
                className="boat-page__map-frame"
                title={`Google térkép - ${portLocationLabel}`}
                src={googleMapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            {googleMapsPageUrl && (
              <a
                className="boat-page__map-link"
                href={googleMapsPageUrl}
                target="_blank"
                rel="noreferrer"
              >
                Megnyitás Google Maps-ben
              </a>
            )}
          </>
        ) : (
          <p className="boat-page__map-empty">
            A térkép megjelenítéséhez kikötő név és város szükséges.
          </p>
        )}
      </section>

      <section className="boat-page__reviews" aria-label="Vélemények">
        <div className="boat-page__reviews-header">
          <h2>Vélemények</h2>
          {reviewsLoading ? (
            <p>Vélemények betöltése...</p>
          ) : reviewsError ? (
            <p>Nem sikerült betölteni a véleményeket.</p>
          ) : reviewSummary.count > 0 ? (
            <p>
              {reviewSummary.average} / 5 ({reviewSummary.count} értékelés)
            </p>
          ) : (
            <p>Még nincs értékelés erről a hirdetésről.</p>
          )}
        </div>

        {reviewsLoading ? (
          <p className="boat-page__reviews-status">Vélemények betöltése...</p>
        ) : reviewsError ? (
          <p className="boat-page__reviews-status">
            Nem sikerült betölteni a véleményeket.
          </p>
        ) : reviews.length ? (
          <div className="boat-page__reviews-list">
            {localReviews.map((review) => {
              const reviewerName =
                review?.user?.name ||
                review?.reviewer?.name ||
                review?.reservation?.user?.name ||
                "Ismeretlen felhasználó";
              const createdAt = review?.created_at
                ? new Date(review.created_at).toLocaleDateString("hu-HU")
                : "-";

              return (
                <article key={review.id} className="boat-page__review-item">
                  <header>
                    <strong>{reviewerName}</strong>
                    <span className="boat-page__review-stars">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          className={
                            s <= Number(review?.rating || 0)
                              ? "boat-page__star boat-page__star--filled"
                              : "boat-page__star"
                          }
                        >
                          ★
                        </span>
                      ))}
                    </span>
                  </header>
                  <p>{review?.comment || "Nincs szöveges vélemény."}</p>
                  <small>{createdAt}</small>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="boat-page__reviews-status">
            Még nincs értékelés erről a hirdetésről.
          </p>
        )}

        {user && (
          <form
            className="boat-page__review-form"
            onSubmit={handleReviewSubmit}
          >
            <h3>Értékelés írása</h3>

            {eligibleReservations.length ? (
              <>
                <label htmlFor="review-reservation">
                  Foglalás kiválasztása
                </label>
                <select
                  id="review-reservation"
                  value={selectedReservationId}
                  onChange={(event) =>
                    setSelectedReservationId(event.target.value)
                  }
                >
                  {eligibleReservations.map((reservation) => (
                    <option key={reservation.id} value={reservation.id}>
                      #{reservation.id} | {reservation.start_date} -{" "}
                      {reservation.end_date}
                    </option>
                  ))}
                </select>

                <label htmlFor="review-rating">Értékelés</label>
                <div
                  className="boat-page__rating-stars"
                  role="group"
                  aria-label="Értékelés csillagokkal"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`boat-page__rating-star${value <= reviewRating ? " is-active" : ""}`}
                      onClick={() => setReviewRating(value)}
                      aria-label={`${value} csillag`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="boat-page__rating-label">
                    {reviewRating} / 5
                  </span>
                </div>

                <label htmlFor="review-comment">Vélemény</label>
                <textarea
                  id="review-comment"
                  rows={4}
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  placeholder="Írd le a tapasztalataidat a hajóval és a hirdetővel kapcsolatban."
                />

                {reviewSubmitError && (
                  <p className="boat-page__review-error">{reviewSubmitError}</p>
                )}

                <button type="submit" disabled={isSubmittingReview}>
                  {isSubmittingReview ? "Mentés..." : "Értékelés küldése"}
                </button>
              </>
            ) : (
              <p className="boat-page__reviews-status">
                Értékelést csak olyan foglaláshoz tudsz írni, amit ennél a
                hirdetésnél még nem értékeltél.
              </p>
            )}
          </form>
        )}
      </section>

      <section className="boat-page__owner" aria-label="Hirdető profilja">
        <button
          type="button"
          className="boat-page__owner-toggle"
          onClick={() => setIsOwnerExpanded((prev) => !prev)}
        >
          <span>
            <strong>{owner?.name || "Ismeretlen hirdető"}</strong>
            <small>Hirdető profilja</small>
          </span>
          <span>
            {isOwnerExpanded ? "Részletek elrejtése" : "Részletek megnyitása"}
          </span>
        </button>

        {isOwnerExpanded && (
          <article className="boat-page__owner-card">
            <img src={ownerAvatar} alt={owner?.name || "Hirdető"} />
            <div>
              <h3>{owner?.name || "Ismeretlen hirdető"}</h3>
              <p>
                <strong>Szerepkör:</strong> {owner?.role || "-"}
              </p>
              <p>
                <strong>Email:</strong> {owner?.email || "Nincs megadva"}
              </p>
              <p>
                <strong>Telefon:</strong>{" "}
                {owner?.phone_number || "Nincs megadva"}
              </p>
              <p>
                <strong>Értékelések a hirdetésen:</strong> {reviewSummary.count}
              </p>
            </div>
          </article>
        )}
      </section>

      {isLightboxOpen && visibleImageUrls[lightboxImageIndex] && (
        <div className="boat-page__lightbox" onClick={closeLightbox}>
          <div
            className="boat-page__lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="boat-page__lightbox-close"
              onClick={closeLightbox}
            >
              ×
            </button>
            <div className="boat-page__lightbox-counter">
              {lightboxImageIndex + 1} / {visibleImageUrls.length}
            </div>
            <img
              src={visibleImageUrls[lightboxImageIndex]}
              alt={`${boat.name} nagy kép`}
              onError={() =>
                markUrlAsBroken(visibleImageUrls[lightboxImageIndex])
              }
            />

            {visibleImageUrls.length > 1 && (
              <>
                <button
                  type="button"
                  className="boat-page__lightbox-nav boat-page__lightbox-nav--prev"
                  onClick={showPreviousImage}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="boat-page__lightbox-nav boat-page__lightbox-nav--next"
                  onClick={showNextImage}
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default BoatPage;
