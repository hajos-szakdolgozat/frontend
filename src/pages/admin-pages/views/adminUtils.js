export const extractList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("hu-HU");
};

export const formatMoney = (value, currency = "€") => {
  const amount = Number(value || 0);
  return `${amount.toLocaleString("hu-HU")} ${currency}`;
};
