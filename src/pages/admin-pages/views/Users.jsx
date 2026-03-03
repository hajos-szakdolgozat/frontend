import { useMemo, useState } from "react";
import logo from "./images/logo.png";
import useFetch from "../../../hooks/useFetch";
import { extractList } from "./adminUtils";

function Users() {
  const [query, setQuery] = useState("");
  const { fetchedData, loading, error } = useFetch("/api/users");

  const users = useMemo(() => extractList(fetchedData), [fetchedData]);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;

    return users.filter((user) => {
      const name = String(user?.name || "").toLowerCase();
      const email = String(user?.email || "").toLowerCase();
      return name.includes(normalizedQuery) || email.includes(normalizedQuery);
    });
  }, [users, query]);

  const renterCount = users.filter((user) => {
    const role = String(user?.role || "").toLowerCase();
    return role.includes("user") || role.includes("berlo") || role.includes("renter");
  }).length;

  const ownerCount = users.filter((user) => {
    const role = String(user?.role || "").toLowerCase();
    return role.includes("owner") || role.includes("berbeado") || role.includes("host");
  }).length;

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
            placeholder="Keresés név vagy email alapján..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <div>
            <strong>{users.length}</strong>
            <p>Profilok</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>{renterCount}</strong>
            <p>Bérlők</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>{ownerCount}</strong>
            <p>Bérbeadók</p>
          </div>
        </div>
      </div>

      <div className="ads-table-container">
        <div className="ads-table-header">
          <span>Felhasználók</span>
        </div>
        {/* Felhasználók táblázat */}
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Név</th>
              <th>Email</th>
              <th>Szerep</th>
              <th>Státusz</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>{user.role || "-"}</td>
                  <td>{user.is_active === false ? "Inaktív" : "Aktív"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">Nincs találat.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
