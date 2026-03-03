import { Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import GuestLayout from "./layouts/GuestLayout";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/public-pages/Home";
import Register from "./pages/public-pages/Register";
import Login from "./pages/public-pages/Login";
import AdminPage from "./pages/admin-pages/AdminPage";
import Users from "./pages/admin-pages/views/Users";
import Ads from "./pages/admin-pages/views/Ads";
import Transactions from "./pages/admin-pages/views/Transactions";
import Complaints from "./pages/admin-pages/views/Complaints";
import Statistics from "./pages/admin-pages/views/Statistics";
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
        <Route path="/newBoat" element={<AddBoat />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminPage />}>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<Users />} />
          <Route path="ads" element={<Ads />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="stats" element={<Statistics />} />
        </Route>
      </Route>

      <Route element={<GuestLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  );
}

export default App;
