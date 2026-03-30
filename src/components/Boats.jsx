import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import Boat from "./Boat";

import "./css/Boats.css";

const initialFilters = {
  location: "",
  guests: "",
  checkin: "",
  checkout: "",
  type: "",
  minPrice: "",
  maxPrice: "",
  active: "",
  sort: "newest",
};

const typeOptions = [
  "Sailboat",
  "Catamaran",
  "Yacht",
  "Motorboat",
  "Fishing Boat",
  "Speedboat",
];

const Boats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nextFilters = {
      location: params.get("location") || "",
      guests: params.get("guests") || "",
      checkin: params.get("checkin") || "",
      checkout: params.get("checkout") || "",
      type: params.get("type") || "",
      minPrice: params.get("min_price") || "",
      maxPrice: params.get("max_price") || "",
      active: params.get("active") || "",
      sort: params.get("sort") || "newest",
    };

    setFilters(nextFilters);
    setIsAdvancedOpen(
      Boolean(
        nextFilters.type ||
          nextFilters.minPrice ||
          nextFilters.maxPrice ||
          nextFilters.active ||
          (nextFilters.sort && nextFilters.sort !== "newest"),
      ),
    );
  }, [location.search]);

  const apiUrl = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const query = new URLSearchParams();

    [
      "location",
      "guests",
      "checkin",
      "checkout",
      "type",
      "min_price",
      "max_price",
      "active",
      "sort",
    ].forEach((key) => {
      const value = params.get(key);
      if (value) {
        query.set(key, value);
      }
    });

    const queryString = query.toString();
    return queryString ? `/api/boats?${queryString}` : "/api/boats";
  }, [location.search]);

  const { fetchedData: boats, loading, error } = useFetch(apiUrl);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (event) => {
    event.preventDefault();
    const query = new URLSearchParams();

    if (filters.location.trim()) query.set("location", filters.location.trim());
    if (filters.guests) query.set("guests", filters.guests);
    if (filters.checkin) query.set("checkin", filters.checkin);
    if (filters.checkout) query.set("checkout", filters.checkout);
    if (filters.type) query.set("type", filters.type);
    if (filters.minPrice) query.set("min_price", filters.minPrice);
    if (filters.maxPrice) query.set("max_price", filters.maxPrice);
    if (filters.active) query.set("active", filters.active);
    if (filters.sort) query.set("sort", filters.sort);

    const queryString = query.toString();
    navigate(queryString ? `/?${queryString}` : "/");
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    navigate("/");
  };

  const hasAdvancedFilters =
    Boolean(filters.type || filters.minPrice || filters.maxPrice || filters.active) ||
    filters.sort !== "newest";

  const filtersForm = (
    <section className="boats__advanced">
      <div className="boats__advanced-header">
        <h3>Részletes szűrés</h3>
        <button
          type="button"
          className={`boats__advanced-toggle${isAdvancedOpen ? " is-open" : ""}`}
          onClick={() => setIsAdvancedOpen((prev) => !prev)}
        >
          {hasAdvancedFilters ? "Szűrők aktívak" : "Szűrők megnyitása"}
        </button>
      </div>

      {isAdvancedOpen && (
        <form className="boats__filters" onSubmit={handleApplyFilters}>
          <select
            name="type"
            className="boats__filter boats__filter--type"
            value={filters.type}
            onChange={handleChange}
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
            className="boats__filter boats__filter--min-price"
            value={filters.minPrice}
            onChange={handleChange}
            placeholder="Min ár"
          />
          <input
            type="number"
            min="0"
            name="maxPrice"
            className="boats__filter boats__filter--max-price"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="Max ár"
          />
          <select
            name="active"
            className="boats__filter boats__filter--active"
            value={filters.active}
            onChange={handleChange}
          >
            <option value="">Minden hirdetés</option>
            <option value="1">Csak aktív</option>
            <option value="0">Csak inaktív</option>
          </select>
          <select
            name="sort"
            className="boats__filter boats__filter--sort"
            value={filters.sort}
            onChange={handleChange}
          >
            <option value="newest">Legújabb</option>
            <option value="price_asc">Ár szerint növekvő</option>
            <option value="price_desc">Ár szerint csökkenő</option>
            <option value="rating_desc">Legjobb értékelés</option>
          </select>

          <div className="boats__filter-actions">
            <button type="submit">Szűrés</button>
            <button type="button" className="boats__filter-reset" onClick={handleResetFilters}>
              Alaphelyzet
            </button>
          </div>
        </form>
      )}
    </section>
  );

  if (loading) {
    return <p>Betöltés...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return !loading && !error && boats.length ? (
    <section className="boats">
      <header className="boats__header">
        <h2>Elérhető hajók</h2>
        <p>{boats.length} találat</p>
      </header>

      {filtersForm}

      <div className="boats__grid">
        {boats?.map((boat) => (
          <Boat key={boat.id} boat={boat} />
        ))}
      </div>
    </section>
  ) : (
    <section className="boats">
      <header className="boats__header">
        <h2>Elérhető hajók</h2>
        <p>Nincs találat a megadott szűrésre.</p>
      </header>

      {filtersForm}
    </section>
  );
};

export default Boats;
