import useAuthContext from "../hooks/UseAuthContext";
import { Navigate, Outlet } from "react-router-dom";

const GuestLayout = () => {
  const { user } = useAuthContext();
  return !user ? <Outlet /> : <Navigate to="/" />;
};

export default GuestLayout;
