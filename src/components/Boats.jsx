import { useEffect, useState } from "react";
import { httpClient } from "../api/axios";
import Boat from "./Boat";
import "./css/Boats.css";

const Boats = () => {
  const [boats, setBoats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBoats = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await httpClient.get("/api/boats");
        console.log(data);
        setBoats(data);
      } catch (error) {
        setError(error?.message || "Nem sikerült betölteni a hajót.");
      } finally {
        setLoading(false);
      }
    };

    fetchBoats();
  }, []);

  if (loading) {
    return <p>Betöltés...</p>;
  }

  if (error) {
    return <p>{error.message}</p>;
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
