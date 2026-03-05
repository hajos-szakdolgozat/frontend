import { useMemo, useState } from "react";
import logo from "./images/logo.png";
import useFetch from "../../../hooks/useFetch";
import { extractList, formatDate, formatMoney } from "./adminUtils";

function Ads() {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { fetchedData, loading, error } = useFetch("/api/boats");

  const boats = useMemo(() => extractList(fetchedData), [fetchedData]);

  const filteredBoats = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return boats.filter((boat) => {
      const name = String(boat?.name || "").toLowerCase();
      const owner = String(boat?.user?.name || "").toLowerCase();
      const matchText =
        !normalizedQuery ||
        name.includes(normalizedQuery) ||
        owner.includes(normalizedQuery);

      const createdDate = boat?.created_at ? new Date(boat.created_at) : null;
      const matchesFrom = !fromDate || (createdDate && createdDate >= new Date(fromDate));
      const matchesTo =
        !toDate ||
        (createdDate &&
          createdDate <= new Date(`${toDate}T23:59:59`));

      return matchText && matchesFrom && matchesTo;
    });
  }, [boats, query, fromDate, toDate]);

  const activeCount = boats.filter((boat) => boat?.is_active).length;
  const inactiveCount = boats.length - activeCount;

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
            placeholder="Keresés cím vagy tulajdonos szerint..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div>
            <strong>{activeCount}</strong>
            <p>Aktív</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>{inactiveCount}</strong>
            <p>Inaktív</p>
          </div>
        </div>
      </div>

      <div className="ads-table-container">
        <div className="ads-table-header">
          <span>Hirdetések</span>
          <div className="filter-sidebar">
            <div className="filter-card">
              <label>
                Mettől:
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </label>
              <label>
                Meddig:
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>
        <table className="ads-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cím</th>
              <th>Felhasználó</th>
              <th>Kategória</th>
              <th>Ár</th>
              <th>Létrehozva</th>
            </tr>
          </thead>
          <tbody>
            {filteredBoats.length ? (
              filteredBoats.map((boat) => (
                <tr key={boat.id}>
                  <td>{boat.id}</td>
                  <td>{boat.name || "-"}</td>
                  <td>{boat?.user?.name || "-"}</td>
                  <td>{boat.type || "-"}</td>
                  <td>{formatMoney(boat.price_per_night, boat.currency)}</td>
                  <td>{formatDate(boat.created_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Nincs megjeleníthető hirdetés.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Ads;
