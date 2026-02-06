import { Route, Routes } from "react-router-dom";
import "./App.css";

import Home from "./pages/publicPages/Home";
import Register from "./pages/publicPages/Register";
import Login from "./pages/publicPages/Login";

import AuthLayout from "./layouts/AuthLayout";
import GuestLayout from "./layouts/GuestLayout";

import AdminPage from "./pages/adminPages/AdminPage";

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />    


      <Route element={<AuthLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      <Route element={<GuestLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  );
}

export default App;
