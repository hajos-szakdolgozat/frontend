import { useEffect, useMemo, useState } from "react";
import logo from "./images/logo.png";
import useFetch, { invalidateFetchCache } from "../../../hooks/useFetch";
import { extractList } from "./adminUtils";
import { httpClient } from "../../../api/axios";

const getRoleMeta = (user) => {
  const role = String(user?.role || "").toLowerCase();

  if (role.includes("admin")) {
    return { key: "admin", label: "Admin" };
  }

  if (role.includes("owner") || role.includes("berbeado") || role.includes("host")) {
    return { key: "owner", label: "Bérbeadó" };
  }

  if (role.includes("user") || role.includes("berlo") || role.includes("renter")) {
    return { key: "renter", label: "Bérlő" };
  }

  return { key: "unknown", label: user?.role || "-" };
};

function Users() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
  const { fetchedData, loading, error } = useFetch("/api/users");

  useEffect(() => {
    setUsers(extractList(fetchedData));
  }, [fetchedData]);

  const handleDeleteUser = async (userId, userName) => {
    const accepted = window.confirm(
      `Biztosan törölni szeretnéd ezt a felhasználót: ${userName || `#${userId}`}?`,
    );

    if (!accepted) {
      return;
    }

    setDeletingUserId(userId);
    try {
      await httpClient.delete(`/api/users/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      invalidateFetchCache("/api/users");
    } catch (deleteError) {
      window.alert(deleteError?.response?.data?.message || "A törlés sikertelen volt.");
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return users;

    return users.filter((user) => {
      const name = String(user?.name || "").toLowerCase();
      const email = String(user?.email || "").toLowerCase();
      return name.includes(normalizedQuery) || email.includes(normalizedQuery);
    });
  }, [users, query]);

  const sortedUsers = useMemo(() => {
    const list = [...filteredUsers];
    const { key, direction } = sortConfig;

    list.sort((a, b) => {
      let aValue;
      let bValue;

      if (key === "status") {
        aValue = a?.is_active === false ? 0 : 1;
        bValue = b?.is_active === false ? 0 : 1;
      } else {
        aValue = a?.[key];
        bValue = b?.[key];
      }

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
  }, [filteredUsers, sortConfig]);

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

  const renterCount = users.filter((user) => getRoleMeta(user).key === "renter").length;

  const ownerCount = users.filter((user) => getRoleMeta(user).key === "owner").length;

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
              <th>
                <button type="button" className="sort-header-btn" onClick={() => handleSort("id")}>
                  ID <span className="sort-caret">{getSortIndicator("id")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header-btn"
                  onClick={() => handleSort("name")}
                >
                  Név <span className="sort-caret">{getSortIndicator("name")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header-btn"
                  onClick={() => handleSort("email")}
                >
                  Email <span className="sort-caret">{getSortIndicator("email")}</span>
                </button>
              </th>
              <th>
                <button
                  type="button"
                  className="sort-header-btn"
                  onClick={() => handleSort("role")}
                >
                  Szerep <span className="sort-caret">{getSortIndicator("role")}</span>
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
              <th>Törlés</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.length ? (
              sortedUsers.map((user) => {
                const roleMeta = getRoleMeta(user);
                return (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name || "-"}</td>
                  <td>{user.email || "-"}</td>
                  <td>
                    <span className={`admin-role-badge admin-role-badge--${roleMeta.key}`}>
                      {roleMeta.label}
                    </span>
                  </td>
                  <td>{user.is_active === false ? "Inaktív" : "Aktív"}</td>
                  <td>
                    <button
                      type="button"
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={deletingUserId === user.id}
                    >
                      {deletingUserId === user.id ? "Törlés..." : "Törlés"}
                    </button>
                  </td>
                </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6">Nincs találat.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
