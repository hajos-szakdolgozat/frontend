import { Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./pages/public-pages/Home";
import Register from "./pages/public-pages/Register";
import Login from "./pages/public-pages/Login";

import AuthLayout from "./layouts/AuthLayout";
import GuestLayout from "./layouts/GuestLayout";

import AdminPage from "./pages/admin-pages/AdminPage";
import BoatPage from "./pages/public-pages/BoatPage";

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />

      <Route element={<AuthLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/boat/:id" element={<BoatPage />} />
      </Route>

      <Route element={<GuestLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  );
}

export default App;
