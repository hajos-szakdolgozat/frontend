import useAuthContext from "../hooks/useAuthContext";
import { Navigate, Outlet, Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const AuthLayout = () => {
  const { user, authLoading } = useAuthContext();

  if (authLoading) {
    return null;
  }

  return user ? (
    <>
      <Navbar />
      <Outlet />
    </>
  ) : (
    <Navigate to="/login" />
  );
};

export default AuthLayout;
