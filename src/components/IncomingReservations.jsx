import Reservation from "./Reservation";
import { useEffect, useState } from "react";
import useAuthContext from "../hooks/useAuthContext";
import { httpClient } from "../api/axios";

import "../pages/public-pages/css/ReservationsPage.css";

const Reservations = () => {
  const { user, authLoading } = useAuthContext();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.id) {
      setReservations([]);
      setLoading(false);
      setError("");
      return;
    }

    let isActive = true;

    const fetchIncomingReservations = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await httpClient.get(
          `/api/reservations/myReservations/${user.id}`,
        );

        if (isActive) {
          setReservations(Array.isArray(data) ? data : []);
        }
      } catch (fetchError) {
        if (isActive) {
          setError(fetchError?.message || "Hiba az adatok betöltése során");
          setReservations([]);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchIncomingReservations();

    return () => {
      isActive = false;
    };
  }, [authLoading, user?.id]);

  if (authLoading) {
    return (
      <p className="reservations-page__status">Felhasználó betöltése...</p>
    );
  }

  if (!user) {
    return (
      <p className="reservations-page__status">
        Jelentkezz be a foglalások megtekintéséhez.
      </p>
    );
  }

  if (loading) {
    return <p className="reservations-page__status">Betöltés...</p>;
  }

  if (error) {
    return <p className="reservations-page__status">{error}</p>;
  }

  const handleUpdateStatus = async (reservationId, status) => {
    setUpdatingId(reservationId);
    setError("");

    try {
      const { data } = await httpClient.patch(
        `/api/reservations/${reservationId}/status`,
        { status },
      );

      const updatedReservation = data?.reservation;
      if (!updatedReservation) {
        throw new Error("Nem érkezett frissített foglalás válasz.");
      }

      setReservations((prev) =>
        prev.map((reservation) =>
          reservation.id === reservationId ? updatedReservation : reservation,
        ),
      );
    } catch (updateError) {
      const message =
        updateError?.response?.data?.message ||
        updateError?.message ||
        "Foglalás státuszának frissítése sikertelen.";
      setError(message);
    } finally {
      setUpdatingId(null);
    }
  };

  return !loading && !error && reservations.length ? (
    <section className="reservations-page">
      <header className="reservations-page__header">
        <div>
          <h2>Beérkező foglalások</h2>
          <p>{reservations.length} foglalás</p>
        </div>
      </header>
      <div className="reservations-page__grid">
        {reservations?.map((reservation) => (
          <Reservation
            key={reservation.id}
            reservation={reservation}
            onUpdateStatus={handleUpdateStatus}
            isUpdating={updatingId === reservation.id}
          />
        ))}
      </div>
    </section>
  ) : (
    <p className="reservations-page__status">Nincsenek beérkező foglalásaid</p>
  );
};

export default Reservations;
