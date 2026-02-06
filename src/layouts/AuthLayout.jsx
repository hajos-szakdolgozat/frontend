import React from "react";
import useAuthContext from "../hooks/UseAuthContext";
import { Navigate, Outlet, Link } from "react-router-dom";
import Navbar from "../pages/publicPages/Navbar";

const AuthLayout = () => {
  const { user } = useAuthContext();
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
