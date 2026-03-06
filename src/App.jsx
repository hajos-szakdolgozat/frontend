import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";
import GuestLayout from "./layouts/GuestLayout";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";

const Home = lazy(() => import("./pages/public-pages/Home"));
const Register = lazy(() => import("./pages/public-pages/Register"));
const Login = lazy(() => import("./pages/public-pages/Login"));
const AdminPage = lazy(() => import("./pages/admin-pages/AdminPage"));
const Users = lazy(() => import("./pages/admin-pages/views/Users"));
const Ads = lazy(() => import("./pages/admin-pages/views/Ads"));
const Transactions = lazy(() => import("./pages/admin-pages/views/Transactions"));
const Complaints = lazy(() => import("./pages/admin-pages/views/Complaints"));
const Statistics = lazy(() => import("./pages/admin-pages/views/Statistics"));
const BoatPage = lazy(() => import("./pages/public-pages/BoatPage"));
const ReservationsPage = lazy(() => import("./pages/public-pages/ReservationsPage"));
const ReservationPage = lazy(() => import("./pages/public-pages/ReservationPage"));
const AddBoat = lazy(() => import("./components/AddBoat"));
const FavoritesPage = lazy(() => import("./pages/public-pages/FavoritesPage"));

import "./App.css";

function App() {
  return (
    <Suspense fallback={<div style={{ padding: "1rem" }}>Betoltes...</div>}>
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
    </Suspense>
  );
}

export default App;
