import { Link, Outlet } from "react-router-dom";
import Reservation from "../../components/Reservation";
import useFetch from "../../hooks/useFetch";

import "./css/ReservationsPage.css";

const ReservationsPage = () => {
  const {
    fetchedData: reservations,
    loading,
    error,
  } = useFetch("/api/reservations/mine");

  if (loading) {
    return <p>Betöltés...</p>;
  }

  if (error) {
    return <p className="reservations-page__status">{error.message}</p>;
  }

  return (
    <section className="reservations-page">
      <header className="reservations-page__header">
        <div>
          <h2>Foglalásaim</h2>
          <p>{reservations.length} foglalás</p>
        </div>
      </header>

      <div className="reservations-page__grid">
        {reservations.map((reservation) => (
          <Link
            to={`/reservations/${reservation.id}`}
            key={reservation.id}
            className="reservations-page__link"
          >
            <Reservation reservation={reservation} />
          </Link>
        ))}
      </div>

      <Outlet />
    </section>
  );
};

export default ReservationsPage;
