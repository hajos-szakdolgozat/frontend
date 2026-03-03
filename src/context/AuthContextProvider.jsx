import { useState, useEffect } from "react";
import { httpClient } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const csrf = () => httpClient.get("/sanctum/csrf-cookie");
  const navigate = useNavigate();

  const getUser = async () => {
    try {
      const { data } = await httpClient.get("/api/user");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async ({ email, password }) => {
    await csrf();
    setErrors([]);
    try {
      await httpClient.post("/login", { email, password });
      await getUser();
      navigate("/");
    } catch (e) {
      if (e.response.status === 422) {
        setErrors(e.response.data.errors);
      }
    }
  };

  const register = async ({
    name,
    email,
    phone_number,
    password,
    password_confirmation,
  }) => {
    await csrf();
    setErrors([]);
    try {
      await httpClient.post("/register", {
        name,
        email,
        phone_number,
        password,
        password_confirmation,
      });
      await getUser();
      navigate("/");
    } catch (e) {
      if (e.response.status === 422) {
        setErrors(e.response.data.errors);
      }
    }
  };

  const logout = () => {
    httpClient.post("/logout").then(() => {
      setUser(null);
      navigate("/");
    });
  };

  useEffect(() => {
    if (!user) {
      getUser();
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, errors, authLoading, getUser, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
