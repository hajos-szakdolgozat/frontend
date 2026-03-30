import { useEffect, useMemo, useRef, useState } from "react";
import "./css/BookingCalendarField.css";
import {
  WEEKDAY_LABELS,
  addMonths,
  buildMonthGrid,
  formatMonthLabel,
  isSameDay,
  isSameMonth,
  normalizeDate,
  parseApiDate,
} from "../utils/bookingCalendar";

function BookingCalendarField({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  isDateDisabled,
  isDateBlocked,
  initialMonthDate,
}) {
  const rootRef = useRef(null);
  const selectedDate = useMemo(() => parseApiDate(value), [value]);
  const fallbackMonth = useMemo(
    () => normalizeDate(initialMonthDate) || normalizeDate(new Date()),
    [initialMonthDate],
  );
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(selectedDate || fallbackMonth);

  useEffect(() => {
    if (selectedDate) {
      setVisibleMonth(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const calendarDays = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);

  return (
    <div className="booking-calendar" ref={rootRef}>
      <label htmlFor={id}>{label}</label>
      <button
        id={id}
        type="button"
        className="booking-calendar__trigger"
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        disabled={disabled}
      >
        <span>{value || placeholder}</span>
        <span className="booking-calendar__icon" aria-hidden="true">
          📅
        </span>
      </button>

      {isOpen && !disabled && (
        <div className="booking-calendar__popover">
          <div className="booking-calendar__header">
            <button
              type="button"
              className="booking-calendar__nav"
              onClick={() => setVisibleMonth((prev) => addMonths(prev, -1))}
            >
              ←
            </button>
            <strong>{formatMonthLabel(visibleMonth)}</strong>
            <button
              type="button"
              className="booking-calendar__nav"
              onClick={() => setVisibleMonth((prev) => addMonths(prev, 1))}
            >
              →
            </button>
          </div>

          <div className="booking-calendar__weekdays">
            {WEEKDAY_LABELS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="booking-calendar__grid">
            {calendarDays.map((day) => {
              const disabledDay = Boolean(isDateDisabled?.(day));
              const blockedDay = Boolean(isDateBlocked?.(day));
              const className = [
                "booking-calendar__day",
                !isSameMonth(day, visibleMonth) ? "is-outside" : "",
                selectedDate && isSameDay(day, selectedDate) ? "is-selected" : "",
                blockedDay ? "is-blocked" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  className={className}
                  onClick={() => {
                    onChange(day);
                    setIsOpen(false);
                  }}
                  disabled={disabledDay}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingCalendarField;
