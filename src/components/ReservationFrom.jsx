import { useState } from "react";
import { httpClient } from "../api/axios";
import useAuthContext from "../hooks/useAuthContext";
import "./css/ReservationForm.css";
import { useNavigate } from "react-router-dom";

const ReservationFrom = ({ boatId }) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [error, setError] = useState("");

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    setError("");

    if (!startDate.trim() || !endDate.trim()) {
      setError({ message: "A dátumok nem lehetnek üresek!" });
      return;
    }

    try {
      await httpClient.post("/api/reservations", {
        user_id: user.id,
        boat_id: boatId,
        status: "pending",
        start_date: startDate,
        end_date: endDate,
      });

      setStartDate("");
      setEndDate("");
      navigate("/reservations");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        Object.values(error?.response?.data?.errors || {})?.[0]?.[0] ||
        "Foglalás létrehozása sikertelen.";
      setError({ message });
    }
  };

  return (
    <form className="reservation-form" onSubmit={handleSubmitReservation}>
      {error && <p className="reservation-form__error">{error.message}</p>}
      <div className="reservation-form__field">
        <label htmlFor="start-date">Foglalás kezdete</label>
        <input
          type="date"
          name="start-date"
          id="start-date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
      </div>
      <div className="reservation-form__field">
        <label htmlFor="end-date">Foglalás vége</label>
        <input
          type="date"
          name="end-date"
          id="end-date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <input
        className="reservation-form__submit"
        type="submit"
        value={"Foglalás"}
      />
    </form>
  );
};

export default ReservationFrom;
