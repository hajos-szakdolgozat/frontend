import { useEffect, useState } from "react";
import { httpClient } from "../api/axios";

const fetchCache = new Map();
const inFlightRequests = new Map();

export const invalidateFetchCache = (matcher) => {
  if (!matcher) {
    fetchCache.clear();
    return;
  }

  for (const key of fetchCache.keys()) {
    if (typeof matcher === "string" && key.startsWith(matcher)) {
      fetchCache.delete(key);
    }
  }
};

const getCachedOrFetch = async (url, cacheTime) => {
  const now = Date.now();
  const cached = fetchCache.get(url);

  if (cached && now - cached.timestamp < cacheTime) {
    return cached.data;
  }

  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url);
  }

  const request = httpClient
    .get(url)
    .then(({ data }) => {
      fetchCache.set(url, { data, timestamp: Date.now() });
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(url);
    });

  inFlightRequests.set(url, request);
  return request;
};

export default function useFetch(url, options = {}) {
  const { cacheTime = 20000 } = options;
  const [fetchedData, setFetchedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getCachedOrFetch(url, cacheTime);
        if (isActive) {
          setFetchedData(data);
        }
      } catch (error) {
        if (isActive) {
          setError(error.message || "Hiba az adatok betöltése során");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
  }, [url, cacheTime]);

  return { fetchedData, loading, error };
}
