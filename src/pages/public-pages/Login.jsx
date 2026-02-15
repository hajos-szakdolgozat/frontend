import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuthContext from "../../hooks/UseAuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, errors } = useAuthContext();

  const handleLogin = async (event) => {
    event.preventDefault();
    login({ email, password });
  };

  return (
    <section>
      <div>
        <div>
          <div>
            <div>
              <div>Laraveller</div>
              <form onSubmit={handleLogin}>
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                  />
                  {errors.email && (
                    <div>
                      <span>{errors.email[0]}</span>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                  />
                  {errors.password && (
                    <div>
                      <span>{errors.password[0]}</span>
                    </div>
                  )}
                </div>
                <div>
                  <button type="submit">Login</button>
                </div>
              </form>
              <Link to="/forgot-password">Forgot Password?</Link>
              <p>
                Not a member yet?
                <Link to="/register">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
