import "./css/Boat.css";
import { httpClient } from "../api/axios";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthContext from "../hooks/useAuthContext";

let favoriteIdsCache = null;
let favoriteIdsRequest = null;

const buildFavoriteIdSet = (payload = []) => {
  const ids = payload
    .map((item) => item?.boat_id ?? item?.boat?.id ?? item?.id)
    .filter((id) => Number.isFinite(Number(id)))
    .map(Number);
  return new Set(ids);
};

const getFavoriteIds = async () => {
  if (favoriteIdsCache) return favoriteIdsCache;
  if (favoriteIdsRequest) return favoriteIdsRequest;

  favoriteIdsRequest = httpClient
    .get("/api/favorites/me")
    .then(({ data }) => {
      favoriteIdsCache = buildFavoriteIdSet(Array.isArray(data) ? data : []);
      return favoriteIdsCache;
    })
    .catch(() => {
      favoriteIdsCache = new Set();
      return favoriteIdsCache;
    })
    .finally(() => {
      favoriteIdsRequest = null;
    });

  return favoriteIdsRequest;
};

const getBoatImages = (boat) => {
  if (Array.isArray(boat?.boat_images)) return boat.boat_images;
  if (Array.isArray(boat?.boatImages)) return boat.boatImages;
  if (Array.isArray(boat?.images)) return boat.images;
  return [];
};

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

const Boat = ({ boat, onFavoriteChange }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuthContext();

  const portLabel = boat?.port?.name
    ? `${boat.port.name} • ${boat.port.city}`
    : "Ismeretlen kikötő";

  const boatImages = getBoatImages(boat);
  const thumbnail =
    boatImages.find((image) => image?.is_thumbnail || image?.isThumbnail) ||
    boatImages[0];

  const imageUrl = resolveBoatImageUrl(thumbnail);
  const favorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.alert("Jelentkezz be a kedvencekhez.");
      return;
    }

    const toggle = async () => {
      try {
        if (!isFavorite) {
          await httpClient.post(`/api/favorites/${boat.id}`);
          setIsFavorite(true);
          if (favoriteIdsCache) favoriteIdsCache.add(Number(boat.id));
          if (onFavoriteChange) onFavoriteChange(boat.id, true);
        } else {
          await httpClient.delete(`/api/favorites/${boat.id}`); // contextbe átrakás (Kirus)
          setIsFavorite(false);
          if (favoriteIdsCache) favoriteIdsCache.delete(Number(boat.id));
          if (onFavoriteChange) onFavoriteChange(boat.id, false);
        }
      } catch (err) {
        console.error(err);
      }
    };

    toggle();
  };

  useEffect(() => {
    let mounted = true;
    const fetchFavoriteState = async () => {
      if (!user) {
        setIsFavorite(false);
        return;
      }

      try {
        const favoriteIds = await getFavoriteIds();
        if (mounted) {
          setIsFavorite(favoriteIds.has(Number(boat.id)));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchFavoriteState();
    return () => (mounted = false);
  }, [user, boat.id]);
  return (
    <Link to={boat.is_active ? `/boat/${boat.id}` : ""} className="boat-card">
      <div className="boat-card__media">
        <span
          className="boat-card__favorite"
          onClick={(e) => favorite(e)}
          style={{ color: isFavorite ? "red" : "gray" }}
        >
          ♥
        </span>
        {imageUrl ? (
          <img src={imageUrl} alt={boat.name} loading="lazy" decoding="async" />
        ) : (
          <div className="boat-card__media-placeholder">
            <span>Nincs kép</span>
          </div>
        )}
      </div>
      <div className="boat-card__header">
        <div>
          <h3 className="boat-card__title">{boat.name}</h3>
          <p className="boat-card__subtitle">{portLabel}</p>
        </div>
        <span className="boat-card__type">{boat.type}</span>
      </div>

      <p className="boat-card__description">
        {boat.description || "Nincs megadott leírás."}
      </p>

      <div className="boat-card__meta">
        <div>
          <span className="boat-card__meta-label">Ár / éj</span>
          <strong className="boat-card__meta-value">
            {boat.price_per_night} {boat.currency || "€"}
          </strong>
        </div>
        <div>
          <span className="boat-card__meta-label">Évjárat</span>
          <strong className="boat-card__meta-value">{boat.year_built}</strong>
        </div>
        <div>
          <span className="boat-card__meta-label">Capacity</span>
          <strong className="boat-card__meta-value">{boat.capacity} pax</strong>
        </div>
        <div>
          <span className="boat-card__meta-label">Méret</span>
          <strong className="boat-card__meta-value">
            {boat.length} m × {boat.width} m
          </strong>
        </div>
        <div>
          <span className="boat-card__meta-label">Merülés</span>
          <strong className="boat-card__meta-value">{boat.draft} m</strong>
        </div>
      </div>

      <div className="boat-card__footer">
        <span className="boat-card__owner">{boat?.user?.name}</span>
        <span
          className={
            boat.is_active ? "boat-card__status is-active" : "boat-card__status"
          }
        >
          {boat.is_active ? "Elérhető" : "Inaktív"}
        </span>
      </div>
    </Link>
  );
};

export default Boat;
