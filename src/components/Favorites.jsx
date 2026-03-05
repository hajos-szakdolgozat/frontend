import useFetch from "../hooks/useFetch";
import Boat from "./Boat";
import { useEffect, useState } from "react";

import "./css/Boats.css";

const Boats = () => {
  const { fetchedData: fetchedBoats, loading, error } = useFetch("/api/favorites/me");
  const [boats, setBoats] = useState([]);

  // synchronize local state with fetched data
  useEffect(() => {
    setBoats(fetchedBoats);
  }, [fetchedBoats]);

  const handleFavoriteChange = (boatId, isNowFavorite) => {
    // if a boat was unfavorited remove it from the list
    if (!isNowFavorite) {
      setBoats((prev) => prev.filter((b) => b.id !== boatId));
    }
  };

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
      </header>
      <div className="boats__grid">
        {boats?.map((boat) => (
          <Boat key={boat.id} boat={boat} onFavoriteChange={handleFavoriteChange} />
        ))}
      </div>
    </section>
  ) : (
    <div>Nincsenek hajók</div>
  );
};

export default Boats;
