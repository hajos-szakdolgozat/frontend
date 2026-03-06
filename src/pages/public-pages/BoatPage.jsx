import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { httpClient } from "../../api/axios";
import ReservationFrom from "../../components/ReservationFrom";
import "./css/BoatPage.css";
import useFetch from "../../hooks/useFetch";
import useAuthContext from "../../hooks/useAuthContext";

const resolveBoatImageUrl = (image) => {
  const rawPath =
    image?.image_url || image?.path || image?.url || image?.image_path || image?.src;
  if (!rawPath) return null;

  if (/^https?:\/\//i.test(rawPath)) {
    return rawPath;
  }

  const baseUrl = String(httpClient.defaults.baseURL || "");
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = String(rawPath).replace(/^\/+/, "");

  if (normalizedPath.startsWith("storage/")) {
    return `${normalizedBase}${normalizedPath}`;
  }

  return `${normalizedBase}storage/${normalizedPath}`;
};

const getBoatImages = (boat) => {
  if (Array.isArray(boat?.boat_images)) return boat.boat_images;
  if (Array.isArray(boat?.boatImages)) return boat.boatImages;
  if (Array.isArray(boat?.images)) return boat.images;
  return [];
};

function BoatPage() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const { fetchedData: boat, loading, error } = useFetch(`/api/boats/${id}`);

  const [pageImageIndex, setPageImageIndex] = useState(0);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [brokenUrls, setBrokenUrls] = useState([]);

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
    galleryImages.find((item) => item.index === pageImageIndex) || galleryImages[0] || null;
  const sideImages = galleryImages.filter((item) => item.index !== pageMainImage?.index);

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
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPreviousImage();
      if (event.key === "ArrowRight") showNextImage();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, visibleImageUrls.length]);

  if (loading) {
    return <p className="boat-page__status">Betoltes...</p>;
  }

  if (error) {
    return <p className="boat-page__status">{error}</p>;
  }

  if (!boat) {
    return <p className="boat-page__status">Hajo nem talalhato.</p>;
  }

  return (
    <section className="boat-page">
      <header className="boat-page__header">
        <div>
          <h1>{boat.name}</h1>
          <p className="boat-page__subtitle">
            {boat?.port?.name} • {boat?.port?.city}
          </p>
        </div>
        <Link className="boat-page__back" to="/">
          Vissza a listahoz
        </Link>
      </header>

      <div className="boat-page__content">
        <section className="boat-page__gallery" aria-label="Hajo kepek">
          {pageMainImage?.url ? (
            <button
              type="button"
              className="boat-page__gallery-main"
              onClick={() => setPageImageIndex(pageMainImage.index)}
              aria-label="Fo kep"
            >
              <img
                src={pageMainImage.url}
                alt={boat.name}
                onError={() => markUrlAsBroken(pageMainImage.url)}
              />
            </button>
          ) : (
            <div className="boat-page__media-placeholder">Nincs kep</div>
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
                    alt={`${boat.name} - kep ${idx + 1}`}
                    onError={() => markUrlAsBroken(item.url)}
                  />
                </button>
              ))
            ) : (
              <div className="boat-page__media-placeholder">Nincs kep</div>
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
            {boat.description || "Nincs megadott leiras."}
          </p>

          <div className="boat-page__stats">
            <div>
              <span>Ar / ej</span>
              <strong>
                {boat.price_per_night} {boat.currency || "EUR"}
              </strong>
            </div>
            <div>
              <span>Evjarat</span>
              <strong>{boat.year_built}</strong>
            </div>
            <div>
              <span>Hossz</span>
              <strong>{boat.length} m</strong>
            </div>
            <div>
              <span>Szelesseg</span>
              <strong>{boat.width} m</strong>
            </div>
            <div>
              <span>Merules</span>
              <strong>{boat.draft} m</strong>
            </div>
            <div>
              <span>Kapcsolattarto</span>
              <strong>{boat?.user?.name}</strong>
            </div>
          </div>
        </div>

        {user ? (
          <ReservationFrom boatId={id} />
        ) : (
          <div className="boat-page__details">
            <p className="boat-page__description">Foglalashoz be kell jelentkezned.</p>
            <Link className="boat-page__back" to="/login">
              Bejelentkezes
            </Link>
          </div>
        )}
      </div>

      {isLightboxOpen && visibleImageUrls[lightboxImageIndex] && (
        <div className="boat-page__lightbox" onClick={closeLightbox}>
          <div className="boat-page__lightbox-content" onClick={(e) => e.stopPropagation()}>
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
              alt={`${boat.name} nagy kep`}
              onError={() => markUrlAsBroken(visibleImageUrls[lightboxImageIndex])}
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
