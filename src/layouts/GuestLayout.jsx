import useAuthContext from "../hooks/useAuthContext";
import { Navigate, Outlet } from "react-router-dom";

const GuestLayout = () => {
  const { user } = useAuthContext();
  return !user ? <Outlet /> : <Navigate to="/" />;
};

export default GuestLayout;
