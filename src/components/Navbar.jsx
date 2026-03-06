import { Link } from "react-router-dom";
import "./css/Navbar.css";
import useAuthContext from "../hooks/useAuthContext";
import img from "../images/userimage.png";
import { httpClient } from "../api/axios";
import { useEffect, useRef, useState } from "react";

function Navbar() {
  const { user, logout } = useAuthContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const dropdownRef = useRef(null);
  const welcomeMessage = user ? `Üdvözöllek, ${user.name}!` : "";
  const hasAvatarPath =
    typeof user?.avatar_path === "string" && user.avatar_path.trim() !== "";
  const avatarSrc = hasAvatarPath
    ? new URL(user.avatar_path, httpClient.defaults.baseURL).toString()
    : img;

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }

    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(systemPrefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>{welcomeMessage}</h2>
        </div>
        <div className="nav-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Hol?"
              className="nav-search-input"
            />
            <input
              type="date"
              placeholder="Check-in"
              className="nav-search-input date-input"
            />
            <input
              type="date"
              placeholder="Check-out"
              className="nav-search-input date-input"
            />
            <select className="nav-search-input">
              <option value="">Vendégek</option>
              <option value="1">1 fő</option>
              <option value="2">2 fő</option>
              <option value="3">3 fő</option>
              <option value="4">4 fő</option>
              <option value="5">5 fő</option>
              <option value="6">6 fő</option>
              <option value="7">7 fő</option>
              <option value="8">8 fő</option>
              <option value="9">9 fő</option>
              <option value="10">10+ fő</option>
            </select>
            <button className="search-button">Keresés</button>
          </div>
        </div>
        <div className="nav-links">
          <div id="navbar-default">
            <ul>
              <li>
                <Link to="/" aria-current="page">
                  Home
                </Link>
              </li>
              <li>
                <button type="button" className="theme-toggle" onClick={toggleTheme}>
                  {theme === "dark" ? "Vilagos" : "Sotet"}
                </button>
              </li>
              <li className="image-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="avatar-button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <img src={avatarSrc} alt="Profil" />
                </button>
                <div className={isDropdownOpen ? "dropdown is-open" : "dropdown"}>
                  <ul>
                    <li>
                      <Link to="/me" onClick={() => setIsDropdownOpen(false)}>Profilom</Link>
                    </li>
                    <li>
                      <Link to="/newBoat" onClick={() => setIsDropdownOpen(false)}>Hajóm kiadása</Link>
                    </li>
                    <li>
                      <Link
                        to="/reservations"
                        aria-current="page"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Foglalásaim
                      </Link>
                    </li>
                    <li>
                      <Link to="/favorites" onClick={() => setIsDropdownOpen(false)}>Kedvenceim</Link>
                    </li>
                    {user ? (
                      <>
                        <li>
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              logout();
                            }}
                            aria-current="page"
                          >
                            LogOut
                          </button>
                        </li>
                      </>
                    ) : (
                      <>
                        <li>
                          <Link to="/login" aria-current="page" onClick={() => setIsDropdownOpen(false)}>
                            Login
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="/register"
                            aria-current="page"
                            onClick={() => setIsDropdownOpen(false)}
                          >
                            Register
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
