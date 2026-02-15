import { useParams, Link } from "react-router-dom";
import { httpClient } from "../../api/axios";
import ReservationFrom from "../../components/ReservationFrom";
import "./css/BoatPage.css";
import useFetch from "../../hooks/useFetch";

const BoatPage = () => {
  const { id } = useParams();
  const { fetchedData: boat, loading, error } = useFetch(`/api/boats/${id}`);

  const thumbnail =
    boat?.boat_images?.find((image) => image.is_thumbnail) ||
    boat?.boat_images?.[0];

  const imageUrl = thumbnail?.path
    ? `${httpClient.defaults.baseURL}storage/${thumbnail.path}`
    : null;

  if (loading) {
    return <p className="boat-page__status">Betöltés...</p>;
  }

  if (error) {
    return <p className="boat-page__status">{error}</p>;
  }

  if (!boat) {
    return <p className="boat-page__status">Hajó nem található.</p>;
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
          Vissza a listához
        </Link>
      </header>

      <div className="boat-page__content">
        <div className="boat-page__media">
          {imageUrl ? (
            <img src={imageUrl} alt={boat.name} />
          ) : (
            <div className="boat-page__media-placeholder">Nincs kép</div>
          )}
        </div>

        <div className="boat-page__details">
          <div className="boat-page__badge">{boat.type}</div>
          <p className="boat-page__description">
            {boat.description || "Nincs megadott leírás."}
          </p>

          <div className="boat-page__stats">
            <div>
              <span>Ár / éj</span>
              <strong>{boat.price_per_night} €</strong>
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
        </div>
        <ReservationFrom boatId={id} />
      </div>
    </section>
  );
};

export default BoatPage;
