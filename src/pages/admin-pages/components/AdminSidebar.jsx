import { useState } from "react";
import { NavLink } from "react-router-dom";

function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const getNavClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <nav className={`admin-sidebar${isOpen ? " is-open" : ""}`}>
      <div className="admin-sidebar__brand">
        <span className="admin-sidebar__title">Admin felület</span>
        <button
          className="admin-sidebar__hamburger"
          aria-label={isOpen ? "Menü bezárása" : "Menü megnyitása"}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>
      <div className="admin-sidebar__links">
        <NavLink to="/admin/users" className={getNavClass} onClick={() => setIsOpen(false)}>Felhasználók</NavLink>
        <NavLink to="/admin/ads" className={getNavClass} onClick={() => setIsOpen(false)}>Hirdetések</NavLink>
        <NavLink to="/admin/transactions" className={getNavClass} onClick={() => setIsOpen(false)}>Tranzakciók</NavLink>
        <NavLink to="/admin/complaints" className={getNavClass} onClick={() => setIsOpen(false)}>Panaszok</NavLink>
        <NavLink to="/admin/stats" className={getNavClass} onClick={() => setIsOpen(false)}>Statisztikák</NavLink>
      </div>
    </nav>
  );
}

export default AdminSidebar;

