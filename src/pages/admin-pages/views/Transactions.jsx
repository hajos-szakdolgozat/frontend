import logo from "./images/logo.png";
function Transactions() {
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
            <p>Összes tranzakció</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>33</strong>
            <p>Folyamatban</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>12</strong>
            <p>Sikertelen</p>
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
                <option value="datum">Dátum szerint</option>
                <option value="mennyiseg">Mennyiség szerint</option>
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

export default Transactions;
