import { useEffect, useMemo, useState } from "react";
import logo from "./images/logo.png";
import useFetch, { invalidateFetchCache } from "../../../hooks/useFetch";
import { extractList, formatDate, formatMoney } from "./adminUtils";
import { httpClient } from "../../../api/axios";

const getRoleMeta = (user) => {
  const role = String(user?.role || "").toLowerCase();

  if (role.includes("admin")) return { key: "admin", label: "Admin" };
  if (role.includes("owner") || role.includes("berbeado") || role.includes("host")) {
    return { key: "owner", label: "Bérbeadó" };
  }
  if (role.includes("user") || role.includes("berlo") || role.includes("renter")) {
    return { key: "renter", label: "Bérlő" };
  }

  // Boat ads are typically created by owners, so provide a clear fallback label.
  return { key: "owner", label: "Bérbeadó" };
};

function Ads() {
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [boats, setBoats] = useState([]);
  const [deletingBoatId, setDeletingBoatId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const { fetchedData, loading, error } = useFetch("/api/boats");

  useEffect(() => {
    setBoats(extractList(fetchedData));
  }, [fetchedData]);

  const handleDeleteBoat = async (boatId, boatName) => {
    const accepted = window.confirm(
      `Biztosan törölni szeretnéd ezt a hirdetést: ${boatName || `#${boatId}`}?`,
    );

    if (!accepted) {
      return;
    }

    setDeletingBoatId(boatId);
    try {
      await httpClient.delete(`/api/boats/${boatId}`);
      setBoats((prevBoats) => prevBoats.filter((boat) => boat.id !== boatId));
      invalidateFetchCache("/api/boats");
    } catch (deleteError) {
      window.alert(deleteError?.response?.data?.message || "A törlés sikertelen volt.");
    } finally {
      setDeletingBoatId(null);
    }
  };

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

  const sortedBoats = useMemo(() => {
    const list = [...filteredBoats];
    const { key, direction } = sortConfig;

    const getValue = (boat) => {
      switch (key) {
        case "owner":
          return boat?.user?.name;
        case "price":
          return Number(boat?.price_per_night ?? 0);
        case "created_at":
          return boat?.created_at ? new Date(boat.created_at).getTime() : null;
        default:
          return boat?.[key];
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
  }, [filteredBoats, sortConfig]);

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
        <img src={logo} alt="kép" className="logo-kep" />
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
              <th>
                <button type="button" className="sort-header-btn" onClick={() => handleSort("id")}>
                  ID <span className="sort-caret">{getSortIndicator("id")}</span>
                </button>
              </th>
              <th>
                <button type="button" className="sort-header-btn" onClick={() => handleSort("name")}>
                  Cím <span className="sort-caret">{getSortIndicator("name")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header-btn"
                  onClick={() => handleSort("owner")}
                >
                  Felhasználó <span className="sort-caret">{getSortIndicator("owner")}</span>
                </button>
              </th>
              <th>
                <button type="button" className="sort-header-btn" onClick={() => handleSort("type")}>
                  Kategória <span className="sort-caret">{getSortIndicator("type")}</span>
                </button>
              </th>
              <th>
                <button type="button" className="sort-header-btn" onClick={() => handleSort("price")}>
                  Ár <span className="sort-caret">{getSortIndicator("price")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header-btn"
                  onClick={() => handleSort("created_at")}
                >
                  Létrehozva <span className="sort-caret">{getSortIndicator("created_at")}</span>
                </button>
              </th>
              <th>Művelet</th>
            </tr>
          </thead>
          <tbody>
            {sortedBoats.length ? (
              sortedBoats.map((boat) => {
                const ownerRole = getRoleMeta(boat?.user);
                return (
                <tr key={boat.id}>
                  <td>{boat.id}</td>
                  <td>{boat.name || "-"}</td>
                  <td>
                    <div className="admin-owner-cell">
                      <span>{boat?.user?.name || "-"}</span>
                      <span className={`admin-role-badge admin-role-badge--${ownerRole.key}`}>
                        {ownerRole.label}
                      </span>
                    </div>
                  </td>
                  <td>{boat.type || "-"}</td>
                  <td>{formatMoney(boat.price_per_night, boat.currency)}</td>
                  <td>{formatDate(boat.created_at)}</td>
                  <td>
                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteBoat(boat.id, boat.name)}
                      disabled={deletingBoatId === boat.id}
                    >
                      {deletingBoatId === boat.id ? "Törlés..." : "Törlés"}
                    </button>
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7">Nincs megjeleníthető hirdetés.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Ads;
