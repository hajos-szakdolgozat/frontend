import { httpClient } from "../api/axios";

let favoriteIdsCache = null;
let favoriteIdsRequest = null;

const buildFavoriteIdSet = (payload = []) => {
  const ids = payload
    .map((item) => item?.boat_id ?? item?.boat?.id ?? item?.id)
    .filter((id) => Number.isFinite(Number(id)))
    .map(Number);
  return new Set(ids);
};

export const getFavoriteIds = async () => {
  if (favoriteIdsCache) return favoriteIdsCache;
  if (favoriteIdsRequest) return favoriteIdsRequest;

  favoriteIdsRequest = httpClient
    .get("/api/favorites/me")
    .then(({ data }) => {
      favoriteIdsCache = buildFavoriteIdSet(Array.isArray(data) ? data : []);
      return favoriteIdsCache;
    })
    .catch(() => {
      favoriteIdsCache = new Set();
      return favoriteIdsCache;
    })
    .finally(() => {
      favoriteIdsRequest = null;
    });

  return favoriteIdsRequest;
};

export const addFavoriteIdToCache = (boatId) => {
  if (!favoriteIdsCache) return;
  favoriteIdsCache.add(Number(boatId));
};

export const removeFavoriteIdFromCache = (boatId) => {
  if (!favoriteIdsCache) return;
  favoriteIdsCache.delete(Number(boatId));
};
