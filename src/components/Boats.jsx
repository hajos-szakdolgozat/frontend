import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { httpClient } from "../api/axios";
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

const Boats = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [amenityOptions, setAmenityOptions] = useState([]);
  const amenitiesRef = useRef(null);

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
    const handleClickOutside = (event) => {
      if (
        amenitiesRef.current &&
        !amenitiesRef.current.contains(event.target)
      ) {
        setIsAmenitiesOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const amenities = params.getAll("amenities[]");

    if (!amenities.length) {
      amenities.push(...params.getAll("amenities"));
    }

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
      amenities,
    };

    setFilters(nextFilters);
    setIsAdvancedOpen(
      Boolean(
        nextFilters.type ||
        nextFilters.minPrice ||
        nextFilters.maxPrice ||
        nextFilters.active ||
        nextFilters.amenities.length ||
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

    const amenities = params.getAll("amenities[]");
    if (amenities.length) {
      amenities.forEach((amenity) => query.append("amenities[]", amenity));
    } else {
      params.getAll("amenities").forEach((amenity) => {
        query.append("amenities[]", amenity);
      });
    }

    const queryString = query.toString();
    return queryString ? `/api/boats?${queryString}` : "/api/boats";
  }, [location.search]);

  const { fetchedData: boats, loading, error } = useFetch(apiUrl);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityChange = (amenityValue) => {
    setFilters((prev) => {
      const alreadySelected = prev.amenities.includes(amenityValue);
      return {
        ...prev,
        amenities: alreadySelected
          ? prev.amenities.filter((item) => item !== amenityValue)
          : [...prev.amenities, amenityValue],
      };
    });
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
    if (filters.amenities.length) {
      filters.amenities.forEach((amenity) => {
        query.append("amenities[]", amenity);
      });
    }

    const queryString = query.toString();
    navigate(queryString ? `/?${queryString}` : "/");
    setIsAmenitiesOpen(false);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
    setIsAmenitiesOpen(false);
    navigate("/");
  };

  const hasAdvancedFilters =
    Boolean(
      filters.type ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.active ||
      filters.amenities.length,
    ) || filters.sort !== "newest";

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
            placeholder="Min ár/éj(€)"
          />
          <input
            type="number"
            min="0"
            name="maxPrice"
            className="boats__filter boats__filter--max-price"
            value={filters.maxPrice}
            onChange={handleChange}
            placeholder="Max ár/éj(€)"
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

          <div className="boats__amenities" ref={amenitiesRef}>
            <button
              type="button"
              className={`boats__amenities-toggle${isAmenitiesOpen ? " is-open" : ""}`}
              onClick={() => setIsAmenitiesOpen((prev) => !prev)}
            >
              {filters.amenities.length
                ? `Felszereltség (${filters.amenities.length})`
                : "Felszereltség"}
            </button>

            {isAmenitiesOpen && (
              <div className="boats__amenities-dropdown">
                {amenityOptions.map((amenity) => (
                  <label key={amenity.value} className="boats__amenity-option">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity.value)}
                      onChange={() => handleAmenityChange(amenity.value)}
                    />
                    <span>{amenity.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="boats__filter-actions">
            <button type="submit">Szűrés</button>
            <button
              type="button"
              className="boats__filter-reset"
              onClick={handleResetFilters}
            >
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
