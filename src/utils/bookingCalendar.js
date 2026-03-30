export const WEEKDAY_LABELS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

export const normalizeDate = (dateLike) => {
  if (!dateLike) return null;
  const date = dateLike instanceof Date ? new Date(dateLike) : new Date(dateLike);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
};

export const parseApiDate = (value) => {
  if (!value) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

export const formatApiDate = (dateLike) => {
  const date = normalizeDate(dateLike);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const addDays = (dateLike, amount) => {
  const date = normalizeDate(dateLike);
  if (!date) return null;
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return normalizeDate(next);
};

export const addMonths = (dateLike, amount) => {
  const date = normalizeDate(dateLike);
  if (!date) return null;
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount, 1);
  return normalizeDate(next);
};

export const startOfMonth = (dateLike) => {
  const date = normalizeDate(dateLike);
  if (!date) return null;
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
};

export const isSameDay = (left, right) => {
  const leftDate = normalizeDate(left);
  const rightDate = normalizeDate(right);
  if (!leftDate || !rightDate) return false;
  return leftDate.getTime() === rightDate.getTime();
};

export const isSameMonth = (left, right) => {
  const leftDate = normalizeDate(left);
  const rightDate = normalizeDate(right);
  if (!leftDate || !rightDate) return false;
  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth()
  );
};

const getMondayFirstIndex = (dateLike) => {
  const date = normalizeDate(dateLike);
  if (!date) return 0;
  return (date.getDay() + 6) % 7;
};

export const buildMonthGrid = (monthDate) => {
  const firstDay = startOfMonth(monthDate);
  if (!firstDay) return [];

  const firstGridDay = addDays(firstDay, -getMondayFirstIndex(firstDay));
  return Array.from({ length: 42 }, (_, index) => addDays(firstGridDay, index));
};

export const formatMonthLabel = (dateLike) => {
  const date = normalizeDate(dateLike);
  if (!date) return "";
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "long",
  }).format(date);
};
