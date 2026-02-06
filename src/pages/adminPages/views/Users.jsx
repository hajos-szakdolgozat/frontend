function Users() {
  return (
    <div className="admin-content">
      {/* Fejléc */}
      <div className="admin-header">
        <h2>Felhasználók</h2>

        <div className="admin-search">
          <label>Keresés:</label>
          <input type="text" placeholder="Keresés név alapján..." />
        </div>
      </div>

      {/* Statisztikai kártyák */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div>
            <strong>55</strong>
            <p>Profilok</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>40</strong>
            <p>Bérlők</p>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <strong>15</strong>
            <p>Bérbeadók</p>
          </div>
        </div>
      </div>

      {/* Felhasználók táblázat */}
      <table className="user-table">
        <thead>
          <tr>
            <th>Név</th>
            <th>Szerep</th>
            <th>Státusz</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Béla</td>
            <td>Bérlő</td>
            <td>Offline</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Users;
