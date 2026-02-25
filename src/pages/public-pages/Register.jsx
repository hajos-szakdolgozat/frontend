import { useState } from "react";
import { Link } from "react-router-dom";
import useAuthContext from "../../hooks/useAuthContext";

const Register = () => {
  const [name, setName] = useState("");
  // const [lastname, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(0);
  const [password_confirmation, setPassword_confirmation] = useState("");
  const { register, errors } = useAuthContext();

  const handleRegister = async (event) => {
    event.preventDefault();
    register({
      name,
      email,
      phone_number: phoneNumber,
      password,
      password_confirmation,
    });
  };

  return (
    <section>
      <div>
        <div>
          <div>
            <div>
              <div></div>
              <form onSubmit={handleRegister}>
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="FirstName"
                  />
                  {errors.name && (
                    <div>
                      <span>{errors.name[0]}</span>
                    </div>
                  )}
                </div>
                {/* <div>
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="LastName"
                  />
                  <div>
                    <span></span>
                  </div>
                </div> */}
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
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="Telefonszám"
                  />
                  {errors.phone_number && (
                    <div>
                      <span>{errors.phone_number[0]}</span>
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
                  <input
                    type="password"
                    value={password_confirmation}
                    onChange={(e) => setPassword_confirmation(e.target.value)}
                    placeholder="Password Confirmation"
                  />
                </div>
                {errors.password_confirmation && (
                  <div>
                    <span>{errors.password_confirmation[0]}</span>
                  </div>
                )}
                <div>
                  <button type="submit">Register</button>
                </div>
              </form>
              <p>
                <Link to="/login">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
