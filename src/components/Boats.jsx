import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import Boat from "./Boat";

import "./css/Boats.css";

const Boats = () => {
  const location = useLocation();

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
    </section>
  );
};

export default Boats;
