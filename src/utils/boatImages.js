import { httpClient } from "../api/axios";

export const getBoatImages = (boatPayload) => {
  if (Array.isArray(boatPayload?.boat_images)) return boatPayload.boat_images;
  if (Array.isArray(boatPayload?.boatImages)) return boatPayload.boatImages;
  if (Array.isArray(boatPayload?.images)) return boatPayload.images;
  return [];
};

export const resolveBoatImageUrl = (image) => {
  const rawPath =
    image?.image_url || image?.path || image?.url || image?.image_path || image?.src;
  if (!rawPath) return null;

  if (/^https?:\/\//i.test(rawPath)) {
    return rawPath;
  }

  const baseUrl = String(httpClient.defaults.baseURL || "");
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = String(rawPath).replace(/^\/+/, "");

  if (normalizedPath.startsWith("storage/")) {
    return `${normalizedBase}${normalizedPath}`;
  }

  return `${normalizedBase}storage/${normalizedPath}`;
};
