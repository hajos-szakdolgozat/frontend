import logo from "./images/logo.png";
function Ads() {
  return (
    <div className="admin-content">
      {/* Fejléc */}
      <div className="admin-header">
        <img src={logo} alt="kep" className="logo-kep" />
        <div className="admin-search">
          <label>Keresés:</label>
          <input type="text" placeholder="Keresés név alapján..." />
        </div>
      </div>
      {/* Statisztikák */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div>
            <strong>55</strong>
            <p>Aktív</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>40</strong>
            <p>Függőben</p>
          </div>
        </div>
      </div>

      {/* Hirdetések táblázat */}
      <div className="ads-table-container">
        <div className="ads-table-header">
          <span>Hirdetések</span>
          <div className="filter-sidebar">
            <div className="filter-card">
              <label>
                Mettől:
                <input type="date" />
              </label>
              <label>
                Meddig:
                <input type="date" />
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
            </tr>
          </thead>
          <tbody>{/* Üres mock adatok nélkül */}</tbody>
        </table>
      </div>
    </div>
  );
}

export default Ads;
