import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const PublicLayout = () => {
  return (
    <>
      <Navbar />
      <div className="with-navbar-offset">
        <Outlet />
      </div>
    </>
  );
};

export default PublicLayout;
