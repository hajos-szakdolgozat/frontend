import { httpClient } from "../api/axios";

export const getBoatImages = (boatPayload) => {
  if (Array.isArray(boatPayload?.boat_images)) return boatPayload.boat_images;
  if (Array.isArray(boatPayload?.boatImages)) return boatPayload.boatImages;
  if (Array.isArray(boatPayload?.images)) return boatPayload.images;
  return [];
};

export const resolveBoatImageUrl = (image) => {
  const rawPath =
    image?.image_url ||
    image?.path ||
    image?.url ||
    image?.image_path ||
    image?.src;
  if (!rawPath) return null;

  const baseUrl = String(httpClient.defaults.baseURL || "");
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  if (/^https?:\/\//i.test(rawPath)) {
    try {
      const absolute = new URL(rawPath);
      const backendBase = new URL(normalizedBase);

      if (
        absolute.pathname.startsWith("/storage/") &&
        absolute.host !== backendBase.host
      ) {
        return new URL(
          absolute.pathname.replace(/^\/+/, ""),
          normalizedBase,
        ).toString();
      }
    } catch {
      return rawPath;
    }

    return rawPath;
  }

  const normalizedPath = String(rawPath).replace(/^\/+/, "");

  if (normalizedPath.startsWith("storage/")) {
    return `${normalizedBase}${normalizedPath}`;
  }

  return `${normalizedBase}storage/${normalizedPath}`;
};
