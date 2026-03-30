import { Link, useLocation, useNavigate } from "react-router-dom";
import "./css/Navbar.css";
import useAuthContext from "../hooks/useAuthContext";
import userImg from "../images/userimage.png";
import img from "../pages/admin-pages/views/images/logo.png";
import { useEffect, useRef, useState } from "react";
import { resolveAvatarUrl } from "../utils/avatarImage";

function Navbar() {
  const { user, logout } = useAuthContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [searchLocation, setSearchLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const welcomeMessage = user ? `Üdvözöllek, ${user.name}!` : "";
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const avatarSrc = avatarLoadFailed
    ? userImg
    : resolveAvatarUrl(user?.avatar_path, userImg);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.avatar_path]);

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

    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    setTheme(systemPrefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchLocation.trim()) {
      params.set("location", searchLocation.trim());
    }
    if (checkIn) {
      params.set("checkin", checkIn);
    }
    if (checkOut) {
      params.set("checkout", checkOut);
    }
    if (guests) {
      params.set("guests", guests);
    }

    const queryString = params.toString();
    const target = queryString ? `/?${queryString}` : "/";

    if (location.pathname !== "/" || location.search !== `?${queryString}`) {
      navigate(target);
    }
  };

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-logo">
          <Link to="/" className="brand-logo">
            <span className="brand-name">DockJet</span>
            <span className="brand-image">
              <img src={img} alt="Brand icon" />
            </span>
          </Link>
          <h2>{welcomeMessage}</h2>
        </div>
        <div className="nav-search">
          <div className="search-container">
            <input
              type="text"
              placeholder="Hol?"
              className="nav-search-input"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
            />
            <input
              type="date"
              placeholder="Check-in"
              className="nav-search-input date-input"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
            />
            <input
              type="date"
              placeholder="Check-out"
              className="nav-search-input date-input"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
            />
            <select
              className="nav-search-input"
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
            >
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
            <button className="search-button" onClick={handleSearch}>
              Keresés
            </button>
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
              <li className="image-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="avatar-button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                >
                  <img
                    src={avatarSrc}
                    alt="Profil"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                </button>
                <div
                  className={isDropdownOpen ? "dropdown is-open" : "dropdown"}
                >
                  <ul>
                    <li>
                      <Link to="/me" onClick={() => setIsDropdownOpen(false)}>
                        Profilom
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/newBoat"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Hajóm kiadása
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-theme-btn"
                        onClick={() => {
                          toggleTheme();
                          setIsDropdownOpen(false);
                        }}
                      >
                        Téma: {theme === "dark" ? "Világos" : "Sötét"}
                      </button>
                    </li>
                    {isAdmin && (
                      <li>
                        <Link
                          to="/admin/users"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          Admin felület
                        </Link>
                      </li>
                    )}
                    <li>
                      <Link
                        to="/reservations"
                        aria-current="page"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Utazásaim
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/myReservations"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Beérkezett foglalások
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/favorites"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Kedvenceim
                      </Link>
                    </li>
                    {user ? (
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
                    ) : (
                      <>
                        <li>
                          <Link
                            to="/login"
                            aria-current="page"
                            onClick={() => setIsDropdownOpen(false)}
                          >
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
