import { useMemo, useState } from "react";
import logo from "./images/logo.png";
import useFetch from "../../../hooks/useFetch";
import { extractList, formatDate, formatMoney } from "./adminUtils";

function Transactions() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const { fetchedData, loading, error } = useFetch("/api/transactions");

  const transactions = useMemo(() => extractList(fetchedData), [fetchedData]);

  const stats = useMemo(() => {
    const success = transactions.filter((item) => {
      const status = String(item?.status || "").toLowerCase();
      return status.includes("completed") || status.includes("success") || status.includes("paid");
    }).length;

    const failed = transactions.filter((item) => {
      const status = String(item?.status || "").toLowerCase();
      return status.includes("failed") || status.includes("cancel") || status.includes("error");
    }).length;

    const pending = transactions.length - success - failed;
    return { success, failed, pending };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return transactions.filter((item) => {
      const fromUser = String(item?.user?.name || item?.from_user?.name || "").toLowerCase();
      const toUser = String(item?.recipient?.name || item?.to_user?.name || "").toLowerCase();
      const status = String(item?.status || "").toLowerCase();

      const matchesText =
        !normalizedQuery ||
        fromUser.includes(normalizedQuery) ||
        toUser.includes(normalizedQuery) ||
        status.includes(normalizedQuery);

      const matchesStatus = !statusFilter || status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [transactions, query, statusFilter]);

  const sortedTransactions = useMemo(() => {
    const list = [...filteredTransactions];
    const { key, direction } = sortConfig;

    const getValue = (item) => {
      switch (key) {
        case "fromUser":
          return item?.user?.name || item?.from_user?.name;
        case "toUser":
          return item?.recipient?.name || item?.to_user?.name;
        case "amount":
          return Number(item?.amount ?? 0);
        case "created_at":
          return item?.created_at ? new Date(item.created_at).getTime() : null;
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
  }, [filteredTransactions, sortConfig]);

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

  const availableStatuses = useMemo(() => {
    return [...new Set(transactions.map((item) => String(item?.status || "").toLowerCase()).filter(Boolean))];
  }, [transactions]);

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
            placeholder="Keresés név vagy státusz alapján..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div>
            <strong>{transactions.length}</strong>
            <p>Összes tranzakció</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>{stats.pending}</strong>
            <p>Folyamatban</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>{stats.failed}</strong>
            <p>Sikertelen</p>
          </div>
        </div>
      </div>

      <div className="ads-table-container">
        <div className="ads-table-header">
          <span>Tranzakciók</span>
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
                <button
                  type="button"
                  className="sort-header-btn"
                  onClick={() => handleSort("fromUser")}
                >
                  Felhasználó <span className="sort-caret">{getSortIndicator("fromUser")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header-btn"
                  onClick={() => handleSort("toUser")}
                >
                  Címzett <span className="sort-caret">{getSortIndicator("toUser")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header-btn"
                  onClick={() => handleSort("amount")}
                >
                  Mennyiség <span className="sort-caret">{getSortIndicator("amount")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header-btn"
                  onClick={() => handleSort("created_at")}
                >
                  Dátum <span className="sort-caret">{getSortIndicator("created_at")}</span>
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
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.length ? (
              sortedTransactions.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item?.user?.name || item?.from_user?.name || "-"}</td>
                  <td>{item?.recipient?.name || item?.to_user?.name || "-"}</td>
                  <td>{formatMoney(item.amount)}</td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>{item.status || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">Nincs megjeleníthető tranzakció.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;
