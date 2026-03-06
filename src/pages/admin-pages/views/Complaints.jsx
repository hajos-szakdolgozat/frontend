import { useMemo, useState } from "react";
import logo from "./images/logo.png";
import useFetch from "../../../hooks/useFetch";
import { extractList, formatDate } from "./adminUtils";

function Complaints() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const { fetchedData, loading, error } = useFetch("/api/reservations");

  const reservations = useMemo(() => extractList(fetchedData), [fetchedData]);

  const filteredReservations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return reservations.filter((item) => {
      const userName = String(item?.user?.name || "").toLowerCase();
      const boatName = String(item?.boat?.name || "").toLowerCase();
      const status = String(item?.status || "").toLowerCase();

      const matchesText =
        !normalizedQuery ||
        userName.includes(normalizedQuery) ||
        boatName.includes(normalizedQuery) ||
        status.includes(normalizedQuery);

      const matchesStatus = !statusFilter || status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [reservations, query, statusFilter]);

  const sortedReservations = useMemo(() => {
    const list = [...filteredReservations];
    const { key, direction } = sortConfig;

    const getValue = (item) => {
      switch (key) {
        case "user":
          return item?.user?.name;
        case "boat":
          return item?.boat?.name;
        case "date":
          return item?.created_at
            ? new Date(item.created_at).getTime()
            : item?.start_date
              ? new Date(item.start_date).getTime()
              : null;
        default:
          return item?.[key];
      }
    };

    list.sort((a, b) => {
      const aValue = getValue(a);
      const bValue = getValue(b);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      const aString = String(aValue).toLowerCase();
      const bString = String(bValue).toLowerCase();
      const result = aString.localeCompare(bString, "hu");
      return direction === "asc" ? result : -result;
    });

    return list;
  }, [filteredReservations, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      return { key, direction: "asc" };
    });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return "▿";
    return sortConfig.direction === "asc" ? "▴" : "▾";
  };

  const openCount = reservations.filter((item) => {
    const status = String(item?.status || "").toLowerCase();
    return status.includes("pending") || status.includes("open");
  }).length;

  const inProgressCount = reservations.filter((item) => {
    const status = String(item?.status || "").toLowerCase();
    return status.includes("process") || status.includes("confirm");
  }).length;

  const availableStatuses = [...new Set(reservations.map((item) => String(item?.status || "").toLowerCase()).filter(Boolean))];

  if (loading) {
    return <div className="admin-content">Betöltés...</div>;
  }

  if (error) {
    return <div className="admin-content">{error}</div>;
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <img src={logo} alt="kep" className="logo-kep" />
        <div className="admin-search">
          <label>Keresés:</label>
          <input
            type="text"
            placeholder="Keresés név, hajó vagy státusz alapján..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div>
            <strong>{openCount}</strong>
            <p>Nyitottak</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>{inProgressCount}</strong>
            <p>Folyamatban</p>
          </div>
        </div>
      </div>

      <div className="ads-table-container">
        <div className="ads-table-header">
          <span>Panaszok / Foglalási ügyek</span>
          <div className="filter-sidebar">
            <div className="filter-card">
              <select
                name="szures"
                id="szures"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Összes státusz</option>
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <table className="ads-table">
          <thead>
            <tr>
              <th>
                <button type="button" className="sort-header-btn" onClick={() => handleSort("id")}>
                  ID <span className="sort-caret">{getSortIndicator("id")}</span>
                </button>
              </th>
              <th>
                <button type="button" className="sort-header-btn" onClick={() => handleSort("user")}>
                  Felhasználó <span className="sort-caret">{getSortIndicator("user")}</span>
                </button>
              </th>
              <th>
                <button type="button" className="sort-header-btn" onClick={() => handleSort("boat")}>
                  Hajó <span className="sort-caret">{getSortIndicator("boat")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header-btn"
                  onClick={() => handleSort("status")}
                >
                  Státusz <span className="sort-caret">{getSortIndicator("status")}</span>
                </button>
              </th>
              <th>
                <button type="button" className="sort-header-btn" onClick={() => handleSort("date")}>
                  Dátum <span className="sort-caret">{getSortIndicator("date")}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedReservations.length ? (
              sortedReservations.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item?.user?.name || "-"}</td>
                  <td>{item?.boat?.name || "-"}</td>
                  <td>{item?.status || "-"}</td>
                  <td>{formatDate(item.created_at || item.start_date)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Nincs megjeleníthető rekord.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Complaints;
