import "./css/Boat.css";
import { httpClient } from "../api/axios";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuthContext from "../hooks/useAuthContext";

const Boat = ({ boat }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const { user } = useAuthContext();

  const portLabel = boat?.port?.name
    ? `${boat.port.name} • ${boat.port.city}`
    : "Ismeretlen kikötő";

  const thumbnail =
    boat?.boat_images?.find((image) => image.is_thumbnail) ||
    boat?.boat_images?.[0];

  const imageUrl = thumbnail?.path
    ? `${httpClient.defaults.baseURL}storage/${thumbnail.path}`
    : null;
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
        } else {
          await httpClient.delete(`/api/favorites/${boat.id}`);
          setIsFavorite(false);
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
        const { data } = await httpClient.get("/api/favorites/me");
        const myFav = data.find(
          (f) => f.boat_id === boat.id || f.boat?.id === boat.id,
        );
        if (mounted) setIsFavorite(!!myFav);
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
          <img src={imageUrl} alt={boat.name} />
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
            {boat.price_per_night} €
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
