import { useEffect, useMemo, useState } from "react";
import { httpClient } from "../api/axios";
import useAuthContext from "../hooks/useAuthContext";
import "./css/ReservationForm.css";
import { useNavigate } from "react-router-dom";
import BookingCalendarField from "./BookingCalendarField";
import {
  addDays,
  formatApiDate,
  normalizeDate,
  parseApiDate,
} from "../utils/bookingCalendar";

const ReservationFrom = ({
  boatId,
  isBoatActive = true,
  unavailableRanges = [],
}) => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState(null);
  const [serverApprovedRanges, setServerApprovedRanges] = useState([]);

  const today = useMemo(() => normalizeDate(new Date()), []);

  const approvedRanges = useMemo(() => {
    const unique = new Map();

    unavailableRanges.forEach((reservation) => {
      const status = String(reservation?.status || "approved").toLowerCase();
      if (status !== "approved") return;

      const start = reservation?.start_date;
      const end = reservation?.end_date;
      if (!start || !end) return;

      const key = `${start}_${end}`;
      if (!unique.has(key)) {
        unique.set(key, { start_date: start, end_date: end, status: "approved" });
      }
    });

    return Array.from(unique.values());
  }, [unavailableRanges]);

  const parseReservationList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.reservations)) return payload.reservations;
    return [];
  };

  const extractApprovedRanges = (reservations) => {
    const unique = new Map();

    reservations.forEach((reservation) => {
      const status = String(reservation?.status || "").toLowerCase();
      const reservationBoatId = Number(
        reservation?.boat_id || reservation?.boat?.id || 0,
      );

      if (status !== "approved") return;
      if (Number(boatId || 0) && reservationBoatId && reservationBoatId !== Number(boatId)) {
        return;
      }

      if (!reservation?.start_date || !reservation?.end_date) return;

      const key = `${reservation.start_date}_${reservation.end_date}`;
      if (!unique.has(key)) {
        unique.set(key, {
          start_date: reservation.start_date,
          end_date: reservation.end_date,
          status: "approved",
        });
      }
    });

    return Array.from(unique.values());
  };

  const fetchApprovedRanges = async () => {
    const endpoints = [
      `/api/reservations?boat_id=${boatId}`,
      `/api/reservations/boat/${boatId}`,
      `/api/boats/${boatId}/reservations`,
      "/api/reservations",
    ];

    for (const endpoint of endpoints) {
      try {
        const { data } = await httpClient.get(endpoint);
        const ranges = extractApprovedRanges(parseReservationList(data));
        if (ranges.length) {
          setServerApprovedRanges(ranges);
          return ranges;
        }
      } catch {
        // try next endpoint
      }
    }

    setServerApprovedRanges([]);
    return [];
  };

  useEffect(() => {
    if (!boatId) return;
    fetchApprovedRanges();
  }, [boatId]);

  const effectiveApprovedRanges = serverApprovedRanges.length
    ? serverApprovedRanges
    : approvedRanges;

  const isBlockedDate = (dateLike) => {
    const day = normalizeDate(dateLike);
    if (!day) return false;

    return effectiveApprovedRanges.some((reservation) => {
      const start = parseApiDate(reservation.start_date);
      const end = parseApiDate(reservation.end_date);
      if (!start || !end) return false;
      return day >= start && day <= end;
    });
  };

  const hasBlockedDayBetween = (startLike, endLike) => {
    let cursor = normalizeDate(startLike);
    const end = normalizeDate(endLike);
    if (!cursor || !end) return false;

    cursor = addDays(cursor, 1);
    while (cursor && cursor <= end) {
      if (isBlockedDate(cursor)) {
        return true;
      }
      cursor = addDays(cursor, 1);
    }

    return false;
  };

  const hasOverlap = (startValue, endValue, ranges = effectiveApprovedRanges) => {
    const start = parseApiDate(startValue);
    const end = parseApiDate(endValue);
    if (!start || !end) return false;

    return ranges.some((reservation) => {
      const reservedStart = parseApiDate(reservation.start_date);
      const reservedEnd = parseApiDate(reservation.end_date);
      if (!reservedStart || !reservedEnd) return false;
      return start <= reservedEnd && end >= reservedStart;
    });
  };

  const hasConflictSelection = useMemo(() => {
    if (!startDate || !endDate) return false;
    return hasOverlap(startDate, endDate);
  }, [startDate, endDate, effectiveApprovedRanges]);

  const isStartDateDisabled = (dateLike) => {
    const day = normalizeDate(dateLike);
    if (!day) return true;
    return day < today || isBlockedDate(day);
  };

  const isEndDateDisabled = (dateLike) => {
    const day = normalizeDate(dateLike);
    const selectedStart = parseApiDate(startDate);
    if (!day || !selectedStart) return true;
    if (day <= selectedStart) return true;
    if (isBlockedDate(day)) return true;
    return hasBlockedDayBetween(selectedStart, day);
  };

  const handleSubmitReservation = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isBoatActive) {
      setError({ message: "Ez a hirdetés inaktív, ezért nem foglalható." });
      return;
    }

    if (!startDate.trim() || !endDate.trim()) {
      setError({ message: "A dátumok nem lehetnek üresek!" });
      return;
    }

    const parsedStart = parseApiDate(startDate);
    const parsedEnd = parseApiDate(endDate);

    if (!parsedStart || !parsedEnd) {
      setError({ message: "Érvénytelen dátumformátum." });
      return;
    }

    if (parsedEnd <= parsedStart) {
      setError({ message: "A foglalás vége későbbi kell legyen, mint a kezdete." });
      return;
    }

    const latestApprovedRanges = await fetchApprovedRanges();

    if (hasOverlap(startDate, endDate, latestApprovedRanges.length ? latestApprovedRanges : approvedRanges)) {
      setError({
        message:
          "Erre az időpontra már van jóváhagyott foglalás. Kérlek válassz másik dátumtartományt.",
      });
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
      <BookingCalendarField
        id="start-date"
        label="Foglalás kezdete"
        value={startDate}
        onChange={(date) => {
          setStartDate(formatApiDate(date));
          setError(null);
          if (endDate && formatApiDate(date) && endDate <= formatApiDate(date)) {
            setEndDate("");
          }
        }}
        placeholder="Válassz kezdő dátumot"
        isDateDisabled={isStartDateDisabled}
        isDateBlocked={isBlockedDate}
        initialMonthDate={today}
      />

      <BookingCalendarField
        id="end-date"
        label="Foglalás vége"
        value={endDate}
        onChange={(date) => {
          setEndDate(formatApiDate(date));
          setError(null);
        }}
        placeholder="Válassz záró dátumot"
        disabled={!startDate}
        isDateDisabled={isEndDateDisabled}
        isDateBlocked={isBlockedDate}
        initialMonthDate={parseApiDate(startDate) || today}
      />


      {hasConflictSelection && (
        <p className="reservation-form__error">
          A kiválasztott intervallum ütközik egy jóváhagyott foglalással.
        </p>
      )}

      <input
        className="reservation-form__submit"
        type="submit"
        value={"Foglalás"}
        disabled={hasConflictSelection}
      />
    </form>
  );
};

export default ReservationFrom;
