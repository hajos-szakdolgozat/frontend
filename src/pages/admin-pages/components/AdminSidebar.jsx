import { NavLink } from "react-router-dom";

function AdminSidebar() {
  const getNavClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <div className="admin-sidebar">
      <NavLink to="/admin/users" className={getNavClass}>Felhasználók</NavLink>
      <NavLink to="/admin/ads" className={getNavClass}>Hirdetések</NavLink>
      <NavLink to="/admin/transactions" className={getNavClass}>Tranzakciók</NavLink>
      <NavLink to="/admin/complaints" className={getNavClass}>Panaszok</NavLink>
      <NavLink to="/admin/stats" className={getNavClass}>Statisztikák</NavLink>
    </div>
  );
}

export default AdminSidebar;
