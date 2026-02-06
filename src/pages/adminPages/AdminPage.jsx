import React from "react";
import "./css/adminPage.css";
import useAuthContext from "../../hooks/UseAuthContext";

export default function AdminPage() {
  const { user } = useAuthContext();
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="logo">LOGO</div>

        <button className="menu-item active">Felhasználók</button>
        <button className="menu-item">Hirdetések</button>
        <button className="menu-item">Tranzakciók</button>
        <button className="menu-item">Panaszok</button>
        <button className="menu-item">Statisztikák</button>
      </aside>  

      <main className="content">
        <header className="topbar">
          <div className="hamburger">☰ Felhasználók</div>

          <input type="text" placeholder="Keresés" className="search" />

          <div className="profile">
            <span className="avatar">👤</span>
            <span className="username">{user?.name}</span>
          </div>
        </header>

        <section className="cards">
          <div className="card">
            <h3>55</h3>
            <p>Profilok</p>
            <span className="emoji">🤝</span>
          </div>

          <div className="card">
            <h3>40</h3>
            <p>Bérlők</p>
            <span className="emoji">🤝</span>
          </div>

          <div className="card">
            <h3>15</h3>
            <p>Bérbeadók</p>
            <span className="emoji">🤝</span>
          </div>
        </section>

        <section className="tables">
          <div className="table-box">
            <div className="table-header">
              <h4>Személyek</h4>
              <button className="filter-btn">Szűrés</button>
            </div>

            <table>
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
                  <td className="status offline">Offline</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="table-box">
            <div className="table-header">
              <h4>Új személyek</h4>
              <button className="filter-btn">Szűrés</button>
            </div>

            <div className="new-users">👤 Név</div>
          </div>
        </section>
      </main>
    </div>
  );
}
