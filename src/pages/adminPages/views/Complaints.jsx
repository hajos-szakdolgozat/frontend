import logo from "./KEPEK/logo.png";

function Users() {
  return (
    <div className="admin-content">
      <div className="admin-header">
        <img src={logo} alt="kep" className="logo-kep" />
        <div className="admin-search">
          <label>Keresés:</label>
          <input type="text" placeholder="Keresés név alapján..." />
        </div>
      </div>
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div>
            <strong>14</strong>
            <p>Nyitottak</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>33</strong>
            <p>Folyamatban</p>
          </div>
        </div>
      </div>
      {/* Hirdetések táblázat */}
      <div className="ads-table-container">
        <div className="ads-table-header">
          <span>Tranzakciók</span>
          <div className="filter-sidebar">
            <div className="filter-card">
              <select name="szures" id="szures">
                <option value="">Válassz szűrést</option>
                <option value="statusz">Státusz</option>
                <option value="tipus">Típus</option>
                <option value="felhasznalo">Felhasználó</option>
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
            </tr>
          </thead>
          <tbody>{/* Üres mock adatok nélkül */}</tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
