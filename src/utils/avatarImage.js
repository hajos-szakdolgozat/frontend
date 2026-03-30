import { httpClient } from "../api/axios";

export const resolveAvatarUrl = (avatarPath, fallbackAvatar) => {
  if (!avatarPath || typeof avatarPath !== "string") {
    return fallbackAvatar;
  }

  const baseUrl = String(httpClient.defaults.baseURL || "");
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const rawPath = avatarPath.trim();

  if (!rawPath) {
    return fallbackAvatar;
  }

  if (/^https?:\/\//i.test(rawPath)) {
    try {
      const absolute = new URL(rawPath);
      const backendBase = new URL(normalizedBase);

      if (absolute.pathname.startsWith("/storage/")) {
        return new URL(absolute.pathname.replace(/^\/+/, ""), normalizedBase).toString();
      }

      if (absolute.host === backendBase.host) {
        return absolute.toString();
      }

      return rawPath;
    } catch {
      return fallbackAvatar;
    }
  }

  let normalizedPath = rawPath.replace(/^\/+/, "");

  if (normalizedPath.startsWith("public/storage/")) {
    normalizedPath = normalizedPath.replace(/^public\//, "");
  }

  if (!normalizedPath.startsWith("storage/")) {
    normalizedPath = `storage/${normalizedPath}`;
  }

  normalizedPath = normalizedPath.replace(/^storage\/storage\//, "storage/");
  return `${normalizedBase}${normalizedPath}`;
};
