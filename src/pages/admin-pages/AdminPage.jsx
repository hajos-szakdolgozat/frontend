import AdminSidebar from "./components/AdminSidebar";
import AdminContent from "./components/AdminContent";
import "./css/AdminPage.css";

function AdminPage() {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <AdminContent />
    </div>
  );
}

export default AdminPage;
