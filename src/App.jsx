import { Route, Routes } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import GuestLayout from "./layouts/GuestLayout";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/public-pages/Home";
import Register from "./pages/public-pages/Register";
import Login from "./pages/public-pages/Login";
import AdminPage from "./pages/admin-pages/AdminPage";
import BoatPage from "./pages/public-pages/BoatPage";
import ReservationsPage from "./pages/public-pages/ReservationsPage";
import ReservationPage from "./pages/public-pages/ReservationPage";
import AddBoat from "./components/AddBoat";

import "./App.css";
import FavoritesPage from "./pages/public-pages/FavoritesPage";

function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/boat/:id" element={<BoatPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/reservations" element={<ReservationsPage />} />
        <Route path="/reservations/:id" element={<ReservationPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="favorites/me" element={<FavoritesPage />} />
        <Route path="/newBoat" element={AddBoat} />
      </Route>

      <Route element={<AdminLayout />}>
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
