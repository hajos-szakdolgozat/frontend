import React, { useState, useEffect } from "react";
import { httpClient } from "../api/axios";
import useAuthContext from "../hooks/useAuthContext";
import { invalidateFetchCache } from "../hooks/useFetch";
import { getBoatImages } from "../utils/boatImages";
import "./css/AddBoat.css";

const extractCollection = (payload, fallbackKey) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidateKeys = [fallbackKey, "data", "items", "results"];
  for (const key of candidateKeys) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  return [];
};

const AddBoat = () => {
  const { user } = useAuthContext();
  const currentYear = new Date().getFullYear();

  const [ports, setPorts] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [newAmenityName, setNewAmenityName] = useState("");
  const [addingAmenity, setAddingAmenity] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [thumbnailIndex, setThumbnailIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const typeOptions = [
    "Sailboat",
    "Catamaran",
    "Yacht",
    "Motorboat",
    "Fishing Boat",
    "Speedboat",
  ];

  const currencyOptions = ["EUR", "USD", "HUF"];

  const [formData, setFormData] = useState({
    port_id: "",
    name: "",
    description: "",
    price_per_night: "",
    currency: "EUR",
    is_active: true,
    type: "",
    year_built: "",
    capacity: "",
    width: "",
    length: "",
    draft: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const preventWheelValueChange = (event) => {
    event.currentTarget.blur();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) {
      setImageFiles([]);
      setThumbnailIndex(0);
      return;
    }

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      window.alert("Csak kép fájlok tölthetők fel.");
    }

    // Protect the UI and backend from accidental huge batches.
    const limitedFiles = validFiles.slice(0, 8);
    if (validFiles.length > 8) {
      window.alert("Legfeljebb 8 képet tölthetsz fel egyszerre.");
    }

    setImageFiles(limitedFiles);
    setThumbnailIndex(0);
  };

  const handleAmenityToggle = (amenityId) => {
    setSelectedAmenities((prev) => {
      const parsedId = Number(amenityId);
      if (!Number.isInteger(parsedId) || parsedId <= 0) {
        return prev;
      }

      if (prev.includes(parsedId)) {
        return prev.filter((idValue) => idValue !== parsedId);
      }

      return [...prev, parsedId];
    });
  };

  const handleAddAmenity = async () => {
    const trimmedName = newAmenityName.trim();
    if (!trimmedName) {
      window.alert("Adj meg egy felszereltség nevet.");
      return;
    }

    setAddingAmenity(true);
    try {
      const { data } = await httpClient.post("/api/amenities", {
        name: trimmedName,
      });

      const amenityId = Number(data?.id || 0);
      const amenitySlug = String(data?.slug || "").trim();
      const amenityLabel = String(data?.name || trimmedName).trim();

      if (!amenityId) {
        window.alert("A felszereltség mentése sikertelen.");
        return;
      }

      setAmenities((prev) => {
        const alreadyExists = prev.some(
          (item) => Number(item.id) === amenityId,
        );
        if (alreadyExists) {
          return prev;
        }

        return [
          ...prev,
          {
            id: amenityId,
            slug: amenitySlug,
            name: amenityLabel,
          },
        ];
      });

      setSelectedAmenities((prev) =>
        prev.includes(amenityId) ? prev : [...prev, amenityId],
      );
      setNewAmenityName("");
    } catch (error) {
      const backendMessage = error?.response?.data?.message;
      const fieldErrors = error?.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join("\n")
        : "";
      window.alert(
        backendMessage ||
          fieldErrors ||
          "A felszereltség hozzáadása sikertelen.",
      );
    } finally {
      setAddingAmenity(false);
    }
  };

  const removeImageAt = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    setThumbnailIndex((prev) => {
      if (indexToRemove === prev) return 0;
      if (indexToRemove < prev) return prev - 1;
      return prev;
    });
  };

  useEffect(() => {
    const urls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageFiles]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ensure user is logged in
    if (!user) {
      window.alert("Jelentkezz be a hajó feladásához.");
      return;
    }

    if (!user?.id) {
      window.alert("Nem található felhasználói azonosító. Jelentkezz be újra.");
      return;
    }

    if (!imageFiles.length) {
      window.alert("Legalább egy képet tölts fel a hirdetéshez.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === "boolean") {
          payload.append(key, value ? "1" : "0");
          return;
        }
        payload.append(key, String(value ?? ""));
      });

      payload.append("user_id", String(user.id));

      const thumbnailFile = imageFiles[thumbnailIndex] || imageFiles[0];
      if (thumbnailFile) {
        payload.append("thumbnail", thumbnailFile);
      }

      imageFiles.forEach((file) => {
        payload.append("images[]", file);
      });
      payload.append("thumbnail_index", String(thumbnailIndex));
      selectedAmenities.forEach((amenityId) => {
        payload.append("amenities[]", String(amenityId));
      });

      const token = localStorage.getItem("token");
      const requestConfig = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const createResponse = await httpClient.post(
        "/api/newBoat",
        payload,
        requestConfig,
      );
      const createdBoatId = createResponse?.data?.id;

      // Fallback: if /api/newBoat does not persist image files, upload them through the
      // dedicated image endpoint.
      if (createdBoatId) {
        const { data: refreshedBoat } = await httpClient.get(
          `/api/boats/${createdBoatId}`,
        );
        const existingImages = getBoatImages(refreshedBoat);

        if (!existingImages.length && imageFiles.length) {
          await Promise.all(
            imageFiles.map((file, index) => {
              const imagePayload = new FormData();
              imagePayload.append("image", file);
              imagePayload.append(
                "is_thumbnail",
                index === thumbnailIndex ? "1" : "0",
              );
              return httpClient.post(
                `/api/boats/${createdBoatId}/images`,
                imagePayload,
                requestConfig,
              );
            }),
          );
        }
      }

      invalidateFetchCache("/api/boats");

      alert("Boat created successfully!");

      // Reset form
      setFormData({
        port_id: "",
        name: "",
        description: "",
        price_per_night: "",
        currency: "EUR",
        is_active: true,
        type: "",
        year_built: "",
        capacity: "",
        width: "",
        length: "",
        draft: "",
      });
      setSelectedAmenities([]);
      setImageFiles([]);
      setThumbnailIndex(0);
    } catch (error) {
      console.error(error);
      const backendMessage = error?.response?.data?.message;
      const fieldErrors = error?.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join("\n")
        : "";
      alert(backendMessage || fieldErrors || "Error creating boat");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const [portsResult, amenitiesResult] = await Promise.allSettled([
        httpClient.get("/api/ports"),
        httpClient.get("/api/amenities"),
      ]);

      if (portsResult.status === "fulfilled") {
        setPorts(extractCollection(portsResult.value.data, "ports"));
      } else {
        setPorts([]);
        console.error("Failed to load ports", portsResult.reason);
      }

      if (amenitiesResult.status === "fulfilled") {
        setAmenities(extractCollection(amenitiesResult.value.data, "amenities"));
      } else {
        setAmenities([]);
        console.error("Failed to load amenities", amenitiesResult.reason);
      }
    };

    loadData();
  }, []);

  return (
    <section className="add-boat">
      <div className="add-boat__header">
        <h1>Bérbe adom a hajómat</h1>
        <h2>Hajóm adatai</h2>
      </div>

      <form className="add-boat__form" onSubmit={handleSubmit}>
        <div className="add-boat__field">
          <label htmlFor="port_id">Kikötő</label>
          <select
            id="port_id"
            name="port_id"
            value={formData.port_id}
            onChange={handleChange}
            required
          >
            <option value="">Válassz kikötőt</option>
            {ports.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="add-boat__field">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="add-boat__field add-boat__field--full">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>

        <div className="add-boat__field">
          <label htmlFor="price_per_night">Price per night</label>
          <input
            type="number"
            id="price_per_night"
            name="price_per_night"
            value={formData.price_per_night}
            onChange={handleChange}
            onWheel={preventWheelValueChange}
            min="1"
            max="1000000"
            step="1"
            required
          />
        </div>
        <div className="add-boat__field">
          <label htmlFor="currency">Currency</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
          >
            {currencyOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="add-boat__field">
          <label htmlFor="type">Típus</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Válassz típust</option>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="add-boat__field">
          <label htmlFor="year_built">Évjárat</label>
          <input
            type="number"
            id="year_built"
            name="year_built"
            value={formData.year_built}
            onChange={handleChange}
            onWheel={preventWheelValueChange}
            min="1900"
            max={currentYear + 1}
            step="1"
            required
          />
        </div>

        <div className="add-boat__field">
          <label htmlFor="capacity">Capacity</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            onWheel={preventWheelValueChange}
            min="1"
            max="100"
            step="1"
            required
          />
        </div>

        <div className="add-boat__field">
          <label htmlFor="width">Width (m)</label>
          <input
            type="number"
            step="0.01"
            id="width"
            name="width"
            value={formData.width}
            onChange={handleChange}
            onWheel={preventWheelValueChange}
            min="0.5"
            max="30"
            required
          />
        </div>

        <div className="add-boat__field">
          <label htmlFor="length">Length (m)</label>
          <input
            type="number"
            step="0.01"
            id="length"
            name="length"
            value={formData.length}
            onChange={handleChange}
            onWheel={preventWheelValueChange}
            min="2"
            max="120"
            required
          />
        </div>

        <div className="add-boat__field">
          <label htmlFor="draft">Draft (m)</label>
          <input
            type="number"
            step="0.01"
            id="draft"
            name="draft"
            value={formData.draft}
            onChange={handleChange}
            onWheel={preventWheelValueChange}
            min="0.1"
            max="15"
            required
          />
        </div>

        <div className="add-boat__checkbox">
          <label htmlFor="is_active">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            Active
          </label>
        </div>

        <div className="add-boat__field add-boat__field--full">
          <label>Felszereltségek</label>
          <div className="add-boat__amenities-grid">
            {amenities.map((amenity) => {
              const amenityId = Number(amenity.id);
              const isSelectable = Number.isInteger(amenityId) && amenityId > 0;
              return (
                <label
                  key={amenity.id || amenity.slug || amenity.name}
                  className="add-boat__amenity-item"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenityId)}
                    onChange={() => handleAmenityToggle(amenityId)}
                    disabled={!isSelectable}
                  />
                  <span>{amenity.name}</span>
                </label>
              );
            })}
          </div>

          <div className="add-boat__amenity-create">
            <input
              type="text"
              value={newAmenityName}
              onChange={(event) => setNewAmenityName(event.target.value)}
              placeholder="Új felszereltség hozzáadása"
            />
            <button
              type="button"
              onClick={handleAddAmenity}
              disabled={addingAmenity}
            >
              {addingAmenity ? "Hozzáadás..." : "Hozzáadás"}
            </button>
          </div>
        </div>

        <div className="add-boat__field add-boat__field--full">
          <label htmlFor="images">Hajó képek (max 8 db)</label>
          <input
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            required
          />
        </div>

        {imageFiles.length > 0 && (
          <div className="add-boat__field add-boat__field--full">
            <label>Válaszd ki a borítóképet</label>
            <p className="add-boat__hint">
              Kattints egy képre vagy a rádió gombra a thumbnail beállításához.
            </p>
            <div className="add-boat__preview-grid">
              {imageFiles.map((file, index) => (
                <article
                  key={`${file.name}-${index}`}
                  className={
                    thumbnailIndex === index
                      ? "add-boat__preview-card add-boat__preview-card--active"
                      : "add-boat__preview-card"
                  }
                >
                  <button
                    type="button"
                    className="add-boat__preview-select"
                    onClick={() => setThumbnailIndex(index)}
                  >
                    <img src={previewUrls[index]} alt={file.name} />
                  </button>

                  <div className="add-boat__preview-meta">
                    <label className="add-boat__image-item">
                      <input
                        type="radio"
                        name="thumbnailIndex"
                        checked={thumbnailIndex === index}
                        onChange={() => setThumbnailIndex(index)}
                      />
                      <span>{file.name}</span>
                    </label>

                    <button
                      type="button"
                      className="add-boat__image-remove"
                      onClick={() => removeImageAt(index)}
                    >
                      Törlés
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        <button
          className="add-boat__submit"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Feltöltés..." : "Create Boat"}
        </button>
      </form>
    </section>
  );
};

export default AddBoat;
