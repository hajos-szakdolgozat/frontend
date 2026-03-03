import { Navigate, Outlet } from "react-router-dom";
import useAuthContext from "../hooks/useAuthContext";

const AdminLayout = () => {
  const { user, authLoading } = useAuthContext();

  if (authLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const userRole = String(user.role || "").toLowerCase();
  if (userRole !== "admin") {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AdminLayout;
