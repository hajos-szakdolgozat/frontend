import { useState } from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminContent from "./components/AdminContent";
import "./css/adminPage.css";

function AdminPage() {
  const [aktivNezet, setAktivNezet] = useState("users");

  return (
    <div className="admin-layout">
      <AdminSidebar aktivNezet={aktivNezet} setAktivNezet={setAktivNezet} />
      <AdminContent aktivNezet={aktivNezet} />
    </div>
  );
}

export default AdminPage;
