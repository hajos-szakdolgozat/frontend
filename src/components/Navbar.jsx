import { Link } from "react-router-dom";
import "./Navbar.css";
import useAuthContext from "../hooks/UseAuthContext";
function Navbar() {
  const { user, logout } = useAuthContext();
  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-logo">
          <h2>Hajók</h2>
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
          <div id="navbar-default" bis_skin_checked="1">
            <ul>
              <li>
                <Link to="/" aria-current="page">
                  Home
                </Link>
              </li>
              {user ? (
                <>
                  <li>
                    <button onClick={logout} aria-current="page">
                      LogOut
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" aria-current="page">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" aria-current="page">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
