import { useMemo, useState } from "react";
import logo from "./images/logo.png";
import useFetch from "../../../hooks/useFetch";
import { extractList, formatDate, formatMoney } from "./adminUtils";

function Transactions() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
        <img src={logo} alt="kep" className="logo-kep" />

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
              <th>ID</th>
              <th>Felhasználó</th>
              <th>Címzett</th>
              <th>Mennyiség</th>
              <th>Dátum</th>
              <th>Státusz</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length ? (
              filteredTransactions.map((item) => (
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
