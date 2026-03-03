import useAuthContext from "../hooks/useAuthContext";
import { Navigate, Outlet } from "react-router-dom";

const GuestLayout = () => {
  const { user, authLoading } = useAuthContext();

  if (authLoading) {
    return null;
  }

  return !user ? <Outlet /> : <Navigate to="/" />;
};

export default GuestLayout;
