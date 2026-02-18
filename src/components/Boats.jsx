import useFetch from "../hooks/useFetch";
import Boat from "./Boat";

import "./css/Boats.css";

const Boats = () => {
  const { fetchedData: boats, loading, error } = useFetch("/api/boats");

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
    <div>Nincsenek hajók</div>
  );
};

export default Boats;
