import { useEffect, useState } from "react";
import { httpClient } from "../api/axios";

export default function useFetch(url) {
  const [fetchedData, setFetchedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await httpClient.get(url);
        console.log(data);
        setFetchedData(data);
      } catch (error) {
        setError(error.message || "Hiba az adatok betöltése során");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { fetchedData, loading, error };
}
