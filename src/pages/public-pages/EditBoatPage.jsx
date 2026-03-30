import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { httpClient } from "../../api/axios";
import useAuthContext from "../../hooks/useAuthContext";
import { invalidateFetchCache } from "../../hooks/useFetch";
import "../../components/css/AddBoat.css";

const typeOptions = [
  "Sailboat",
  "Catamaran",
  "Yacht",
  "Motorboat",
  "Fishing Boat",
  "Speedboat",
];

const currencyOptions = ["EUR", "USD", "HUF"];

const initialForm = {
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
};

const EditBoatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authLoading } = useAuthContext();

  const [ports, setPorts] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const canEdit = useMemo(() => {
    return Number(user?.id) > 0;
  }, [user?.id]);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const loadEditData = async () => {
      setLoading(true);
      setError("");

      try {
        const [{ data: portsData }, { data: boatData }] = await Promise.all([
          httpClient.get("/api/ports"),
          httpClient.get(`/api/boats/${id}`),
        ]);

        if (cancelled) return;

        const ownerId = Number(boatData?.user_id || boatData?.user?.id || 0);
        const currentUserId = Number(user?.id || 0);
        const isAdmin = user?.role === "admin";

        if (currentUserId && ownerId && ownerId !== currentUserId && !isAdmin) {
          window.alert("Csak a saját hirdetésedet szerkesztheted.");
          navigate(`/boat/${id}`);
          return;
        }

        setPorts(Array.isArray(portsData) ? portsData : []);
        setFormData({
          port_id: String(boatData?.port_id ?? ""),
          name: String(boatData?.name ?? ""),
          description: String(boatData?.description ?? ""),
          price_per_night: String(boatData?.price_per_night ?? ""),
          currency: String(boatData?.currency ?? "EUR"),
          is_active: Boolean(boatData?.is_active),
          type: String(boatData?.type ?? ""),
          year_built: String(boatData?.year_built ?? ""),
          capacity: String(boatData?.capacity ?? ""),
          width: String(boatData?.width ?? ""),
          length: String(boatData?.length ?? ""),
          draft: String(boatData?.draft ?? ""),
        });
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError?.response?.data?.message ||
              "Nem sikerült betölteni a hirdetés adatait.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (!authLoading && canEdit) {
      loadEditData();
    }

    return () => {
      cancelled = true;
    };
  }, [authLoading, canEdit, id, navigate, user?.id, user?.role]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await httpClient.put(`/api/boats/${id}`, {
        ...formData,
        port_id: Number(formData.port_id),
        price_per_night: Number(formData.price_per_night),
        year_built: Number(formData.year_built),
        capacity: Number(formData.capacity),
        width: Number(formData.width),
        length: Number(formData.length),
        draft: Number(formData.draft),
      });

      invalidateFetchCache("/api/boats");
      invalidateFetchCache(`/api/boats/${id}`);
      window.alert("Hirdetés sikeresen frissítve.");
      navigate(`/boat/${id}`);
    } catch (submitError) {
      const fieldErrors = submitError?.response?.data?.errors
        ? Object.values(submitError.response.data.errors).flat().join("\n")
        : "";
      setError(
        submitError?.response?.data?.message ||
          fieldErrors ||
          "A hirdetés frissítése sikertelen.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      "Biztosan törölni szeretnéd ezt a hirdetést? Ez a művelet nem visszavonható.",
    );

    if (!shouldDelete) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await httpClient.delete(`/api/boats/${id}`);
      invalidateFetchCache("/api/boats");
      invalidateFetchCache(`/api/boats/${id}`);
      window.alert("Hirdetés sikeresen törölve.");
      navigate("/");
    } catch (deleteError) {
      setError(
        deleteError?.response?.data?.message ||
          "A hirdetés törlése sikertelen.",
      );
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return <p className="boat-page__status">Betöltés...</p>;
  }

  if (!user) {
    return (
      <section className="add-boat">
        <p>Bejelentkezés szükséges a szerkesztéshez.</p>
        <Link to="/login" className="boat-page__back">
          Bejelentkezés
        </Link>
      </section>
    );
  }

  if (error && !saving) {
    return (
      <section className="add-boat">
        <p className="boat-page__status">{error}</p>
        <Link to={`/boat/${id}`} className="boat-page__back">
          Vissza a hirdetéshez
        </Link>
      </section>
    );
  }

  return (
    <section className="add-boat">
      <div className="add-boat__header">
        <h1>Hirdetés szerkesztése</h1>
        <h2>Módosítsd a hajó adatait</h2>
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
            {ports.map((port) => (
              <option key={port.id} value={port.id}>
                {port.name}
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
            {currencyOptions.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
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
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
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
            min="1"
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

        {error && <p className="boat-page__status">{error}</p>}

        <div className="add-boat__actions">
          <button className="add-boat__submit" type="submit" disabled={saving || deleting}>
            {saving ? "Mentés..." : "Hirdetés frissítése"}
          </button>
          <button
            className="add-boat__delete"
            type="button"
            onClick={handleDelete}
            disabled={saving || deleting}
          >
            {deleting ? "Törlés..." : "Hirdetés törlése"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditBoatPage;
