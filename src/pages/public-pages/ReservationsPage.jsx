import { useEffect, useState } from "react";
import { httpClient } from "../../api/axios";
import { Link, Outlet } from "react-router-dom";
import Reservation from "../../components/Reservation";
import "./css/ReservationsPage.css";

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await httpClient.get("/api/reservations/mine");
        console.log(data);
        setReservations(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

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
