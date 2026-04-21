import { Link, useLocation, useNavigate } from "react-router-dom";
import "./css/Navbar.css";
import useAuthContext from "../hooks/useAuthContext";
import userImg from "../images/userimage.png";
import img from "../pages/admin-pages/views/images/logo.png";
import { useEffect, useRef, useState } from "react";
import { resolveAvatarUrl } from "../utils/avatarImage";
import { applyTheme, getPreferredTheme, persistTheme } from "../utils/theme";
import { httpClient } from "../api/axios";

const initialAdvancedFilters = {
  type: "",
  minPrice: "",
  maxPrice: "",
  active: "",
  sort: "newest",
  amenities: [],
};

const typeOptions = [
  "Sailboat",
  "Catamaran",
  "Yacht",
  "Motorboat",
  "Fishing Boat",
  "Speedboat",
];

const requestedAmenityOptions = [
  { label: "Légkondícionálás", value: "air_conditioning" },
  { label: "Jakuzzi", value: "jacuzzi" },
  { label: "Pótágy", value: "extra_bed" },
  { label: "Wifi", value: "wifi" },
  { label: "Netflix", value: "netflix" },
];

const requestedAmenityMap = new Map(
  requestedAmenityOptions.map((item) => [item.value, item.label]),
);

const toAmenitySlug = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

function Navbar() {
  const { user, logout } = useAuthContext();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isGuestOpen, setIsGuestOpen] = useState(false);
  const [theme, setTheme] = useState(getPreferredTheme);
  const [searchLocation, setSearchLocation] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState(initialAdvancedFilters);
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const dropdownRef = useRef(null);
  const advancedFiltersRef = useRef(null);
  const amenitiesRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const welcomeMessage = user ? `Üdvözöllek, ${user.name}!` : "";
  const isAdmin = String(user?.role || "").toLowerCase() === "admin";
  const isHomeRoute = location.pathname === "/";
  const avatarSrc = avatarLoadFailed
    ? userImg
    : resolveAvatarUrl(user?.avatar_path, userImg);

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [user?.avatar_path]);

  useEffect(() => {
    const syncUnread = (event) => {
      setUnreadNotifications(Number(event?.detail?.unreadCount || 0));
    };

    window.addEventListener("notifications:updated", syncUnread);
    return () => window.removeEventListener("notifications:updated", syncUnread);
  }, []);

  useEffect(() => {
    if (!user) {
      setUnreadNotifications(0);
      return;
    }

    let active = true;

    const loadUnreadCount = async () => {
      try {
        const { data } = await httpClient.get("/api/notifications/unread-count");
        if (active) {
          setUnreadNotifications(Number(data?.unread_count || 0));
        }
      } catch {
        if (active) {
          setUnreadNotifications(0);
        }
      }
    };

    loadUnreadCount();

    return () => {
      active = false;
    };
  }, [user, location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsDropdownOpen(false);
      }

      if (!advancedFiltersRef.current?.contains(event.target)) {
        setIsAdvancedOpen(false);
        setIsAmenitiesOpen(false);
        setIsDateOpen(false);
        setIsGuestOpen(false);
      }

      if (!amenitiesRef.current?.contains(event.target)) {
        setIsAmenitiesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAmenities = async () => {
      try {
        const { data } = await httpClient.get("/api/amenities");
        if (cancelled || !Array.isArray(data)) {
          return;
        }

        const dbValues = new Set(
          data
            .map((item) =>
              String(item?.slug || toAmenitySlug(item?.name || "")).trim(),
            )
            .filter(Boolean),
        );

        const filteredAndOrdered = requestedAmenityOptions
          .filter((item) => dbValues.has(item.value))
          .map((item) => ({
            value: item.value,
            label: requestedAmenityMap.get(item.value) || item.label,
          }));

        setAmenityOptions(filteredAndOrdered);
      } catch {
        if (!cancelled) {
          setAmenityOptions([]);
        }
      }
    };

    loadAmenities();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const amenities = params.getAll("amenities[]");

    if (!amenities.length) {
      amenities.push(...params.getAll("amenities"));
    }

    setSearchLocation(params.get("location") || "");
    setCheckIn(params.get("checkin") || "");
    setCheckOut(params.get("checkout") || "");
    setGuests(params.get("guests") || "");
    setAdvancedFilters({
      type: params.get("type") || "",
      minPrice: params.get("min_price") || "",
      maxPrice: params.get("max_price") || "",
      active: params.get("active") || "",
      sort: params.get("sort") || "newest",
      amenities,
    });
    setIsAdvancedOpen(
      isHomeRoute &&
        Boolean(
          params.get("type") ||
            params.get("min_price") ||
            params.get("max_price") ||
            params.get("active") ||
            amenities.length ||
            ((params.get("sort") || "newest") !== "newest"),
        ),
    );
    setIsAmenitiesOpen(false);
  }, [isHomeRoute, location.search]);

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    setIsNavMenuOpen(false);
    setIsDropdownOpen(false);
    setIsDateOpen(false);
    setIsGuestOpen(false);
  }, [location.pathname, location.search]);

  const formatDateSummary = (value) => {
    if (!value) {
      return "";
    }

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("hu-HU", {
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const dateSummary =
    checkIn && checkOut
      ? `${formatDateSummary(checkIn)} - ${formatDateSummary(checkOut)}`
      : checkIn
        ? `${formatDateSummary(checkIn)} - ?`
        : checkOut
          ? `? - ${formatDateSummary(checkOut)}`
          : "Mikor?";

  const guestSummary = guests ? `${guests} fő` : "Vendégek";

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const buildSearchParams = () => {
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

    if (advancedFilters.type) {
      params.set("type", advancedFilters.type);
    }
    if (advancedFilters.minPrice) {
      params.set("min_price", advancedFilters.minPrice);
    }
    if (advancedFilters.maxPrice) {
      params.set("max_price", advancedFilters.maxPrice);
    }
    if (advancedFilters.active) {
      params.set("active", advancedFilters.active);
    }
    if (advancedFilters.sort) {
      params.set("sort", advancedFilters.sort);
    }
    if (advancedFilters.amenities.length) {
      advancedFilters.amenities.forEach((amenity) => {
        params.append("amenities[]", amenity);
      });
    }

    return params;
  };

  const handleSearch = () => {
    const params = buildSearchParams();

    const queryString = params.toString();
    const target = queryString ? `/?${queryString}` : "/";
    const currentSearch = queryString ? `?${queryString}` : "";

    if (location.pathname !== "/" || location.search !== currentSearch) {
      navigate(target);
    }
  };

  const handleAdvancedChange = (event) => {
    const { name, value } = event.target;
    setAdvancedFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenityValue) => {
    setAdvancedFilters((prev) => {
      const alreadySelected = prev.amenities.includes(amenityValue);
      return {
        ...prev,
        amenities: alreadySelected
          ? prev.amenities.filter((item) => item !== amenityValue)
          : [...prev.amenities, amenityValue],
      };
    });
  };

  const handleAdvancedSubmit = (event) => {
    event.preventDefault();
    handleSearch();
  };

  const handleAdvancedReset = () => {
    setAdvancedFilters(initialAdvancedFilters);
    setIsAmenitiesOpen(false);

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
    navigate(queryString ? `/?${queryString}` : "/");
  };

  const hasAdvancedFilters =
    Boolean(
      advancedFilters.type ||
        advancedFilters.minPrice ||
        advancedFilters.maxPrice ||
        advancedFilters.active ||
        advancedFilters.amenities.length,
    ) || advancedFilters.sort !== "newest";

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
          <div className="search-container" ref={advancedFiltersRef}>
            <div className="search-row">
              <div className="search-shell">
                <label className="nav-search-segment nav-search-segment--location">
                  <span className="nav-search-label">Hol?</span>
                  <input
                    type="text"
                    placeholder="Kikötő vagy város"
                    className="nav-search-input"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </label>

                <div className="nav-search-segment nav-search-segment--dates">
                  <button
                    type="button"
                    className={`nav-search-trigger${isDateOpen ? " is-open" : ""}`}
                    onClick={() => {
                      setIsDateOpen((prev) => !prev);
                      setIsGuestOpen(false);
                    }}
                  >
                    <span className="nav-search-label">Dátumok</span>
                    <span className="nav-search-trigger-value">{dateSummary}</span>
                  </button>

                  {isDateOpen && (
                    <div className="nav-search-popover nav-search-popover--dates">
                      <label className="nav-search-popover-field">
                        <span className="nav-search-chip-label">Érkezés</span>
                        <input
                          type="date"
                          className="nav-search-input date-input"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                        />
                      </label>
                      <label className="nav-search-popover-field">
                        <span className="nav-search-chip-label">Távozás</span>
                        <input
                          type="date"
                          className="nav-search-input date-input"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="nav-search-segment nav-search-segment--guests">
                  <button
                    type="button"
                    className={`nav-search-trigger${isGuestOpen ? " is-open" : ""}`}
                    onClick={() => {
                      setIsGuestOpen((prev) => !prev);
                      setIsDateOpen(false);
                    }}
                  >
                    <span className="nav-search-label">Ki?</span>
                    <span className="nav-search-trigger-value">{guestSummary}</span>
                  </button>

                  {isGuestOpen && (
                    <div className="nav-search-popover nav-search-popover--guests">
                      <div className="nav-search-guest-list">
                        <button
                          type="button"
                          className={`nav-search-guest-option${!guests ? " is-selected" : ""}`}
                          onClick={() => setGuests("")}
                        >
                          Vendégek
                        </button>
                        {Array.from({ length: 10 }, (_, index) => {
                          const value = String(index + 1);
                          return (
                            <button
                              key={value}
                              type="button"
                              className={`nav-search-guest-option${guests === value ? " is-selected" : ""}`}
                              onClick={() => setGuests(value)}
                            >
                              {value === "10" ? "10+ fő" : `${value} fő`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <button className="search-button" onClick={handleSearch}>
                  Keresés
                </button>
              </div>

              {isHomeRoute && (
                <div className="nav-advanced">
                  <button
                    type="button"
                    className={`nav-advanced-toggle${isAdvancedOpen ? " is-open" : ""}`}
                    onClick={() => setIsAdvancedOpen((prev) => !prev)}
                  >
                    Szűrők
                    {hasAdvancedFilters ? " aktív" : ""}
                  </button>

                  {isAdvancedOpen && (
                    <div className="nav-advanced-dropdown">
                      <form className="nav-advanced-form" onSubmit={handleAdvancedSubmit}>
                      <select
                        name="type"
                        className="nav-search-input nav-advanced-field"
                        value={advancedFilters.type}
                        onChange={handleAdvancedChange}
                      >
                        <option value="">Minden típus</option>
                        {typeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="0"
                        name="minPrice"
                        className="nav-search-input nav-advanced-field"
                        value={advancedFilters.minPrice}
                        onChange={handleAdvancedChange}
                        placeholder="Min ár/éj (€)"
                      />

                      <input
                        type="number"
                        min="0"
                        name="maxPrice"
                        className="nav-search-input nav-advanced-field"
                        value={advancedFilters.maxPrice}
                        onChange={handleAdvancedChange}
                        placeholder="Max ár/éj (€)"
                      />

                      <select
                        name="active"
                        className="nav-search-input nav-advanced-field"
                        value={advancedFilters.active}
                        onChange={handleAdvancedChange}
                      >
                        <option value="">Minden hirdetés</option>
                        <option value="1">Csak aktív</option>
                        <option value="0">Csak inaktív</option>
                      </select>

                      <select
                        name="sort"
                        className="nav-search-input nav-advanced-field"
                        value={advancedFilters.sort}
                        onChange={handleAdvancedChange}
                      >
                        <option value="newest">Legújabb</option>
                        <option value="price_asc">Ár szerint növekvő</option>
                        <option value="price_desc">Ár szerint csökkenő</option>
                        <option value="rating_desc">Legjobb értékelés</option>
                      </select>

                      <div className="nav-advanced-amenities" ref={amenitiesRef}>
                        <button
                          type="button"
                          className={`nav-advanced-amenities-toggle${isAmenitiesOpen ? " is-open" : ""}`}
                          onClick={() => setIsAmenitiesOpen((prev) => !prev)}
                        >
                          {advancedFilters.amenities.length
                            ? `Felszereltség (${advancedFilters.amenities.length})`
                            : "Felszereltség"}
                        </button>

                        {isAmenitiesOpen && (
                          <div className="nav-advanced-amenities-dropdown">
                            {amenityOptions.map((amenity) => (
                              <label
                                key={amenity.value}
                                className="nav-advanced-amenity-option"
                              >
                                <input
                                  type="checkbox"
                                  checked={advancedFilters.amenities.includes(
                                    amenity.value,
                                  )}
                                  onChange={() => handleAmenityChange(amenity.value)}
                                />
                                <span>{amenity.label}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="nav-advanced-actions">
                        <button type="submit" className="nav-advanced-submit">
                          Szűrés
                        </button>
                        <button
                          type="button"
                          className="nav-advanced-reset"
                          onClick={handleAdvancedReset}
                        >
                          Alaphelyzet
                        </button>
                      </div>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="nav-links">
          <button
            type="button"
            className="nav-menu-toggle"
            aria-label="Menü megnyitása"
            aria-expanded={isNavMenuOpen}
            onClick={() => setIsNavMenuOpen((prev) => !prev)}
          >
            <span />
            <span />
            <span />
          </button>
          <div
            id="navbar-default"
            className={isNavMenuOpen ? "is-open" : ""}
          >
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
                        to="/notifications"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Értesítések
                        {unreadNotifications > 0 && (
                          <span className="nav-badge">{unreadNotifications}</span>
                        )}
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/my-boats"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Saját hirdetéseim
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
                          Kijelentkezés
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
