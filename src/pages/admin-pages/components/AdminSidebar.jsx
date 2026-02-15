function AdminSidebar({ aktivNezet, setAktivNezet }) {
  return (
    <div className="admin-sidebar">
      <button
        className={aktivNezet === "users" ? "admin-btn active" : "admin-btn"}
        onClick={() => setAktivNezet("users")}
      >
        Felhasználók
      </button>

      <button
        className={aktivNezet === "ads" ? "admin-btn active" : "admin-btn"}
        onClick={() => setAktivNezet("ads")}
      >
        Hirdetések
      </button>

      <button
        className={
          aktivNezet === "transactions" ? "admin-btn active" : "admin-btn"
        }
        onClick={() => setAktivNezet("transactions")}
      >
        Tranzakciók
      </button>

      <button
        className={
          aktivNezet === "complaints" ? "admin-btn active" : "admin-btn"
        }
        onClick={() => setAktivNezet("complaints")}
      >
        Panaszok
      </button>

      <button
        className={aktivNezet === "stats" ? "admin-btn active" : "admin-btn"}
        onClick={() => setAktivNezet("stats")}
      >
        Statisztikák
      </button>
    </div>
  );
}

export default AdminSidebar;
