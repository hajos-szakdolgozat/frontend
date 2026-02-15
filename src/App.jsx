import { Route, Routes } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import GuestLayout from "./layouts/GuestLayout";

import Home from "./pages/public-pages/Home";
import Register from "./pages/public-pages/Register";
import Login from "./pages/public-pages/Login";
import AdminPage from "./pages/admin-pages/AdminPage";
import BoatPage from "./pages/public-pages/BoatPage";
import ReservationsPage from "./pages/public-pages/ReservationsPage";
import ReservationPage from "./pages/public-pages/ReservationPage";

import "./App.css";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/boat/:id" element={<BoatPage />} />
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/reservations/:id" element={<ReservationPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      <Route element={<GuestLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  );
}

export default App;
