import { useState, useEffect } from "react";
import { httpClient } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";

const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [errors, setErrors] = useState([]);
  const csrf = () => httpClient.get("/sanctum/csrf-cookie");
  const navigate = useNavigate();

  const getUser = async () => {
    const { data } = await httpClient.get("/api/user");
    setUser(data);
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
  const register = async ({ name, email, password, password_confirmation }) => {
    await csrf();
    setErrors([]);
    try {
      await httpClient.post("/register", {
        name,
        email,
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
    });
  };
  useEffect(() => {
    if (!user) {
      getUser();
    }
  }, []);
  return (
    <AuthContext.Provider
      value={{ user, errors, getUser, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
