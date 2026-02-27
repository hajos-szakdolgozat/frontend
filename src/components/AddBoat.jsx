import React, { useState } from "react";
import { httpClient } from "../api/axios";
import "./css/AddBoat.css";

const AddBoat = () => {
  const [formData, setFormData] = useState({
    port_id: "",
    name: "",
    description: "",
    price_per_night: "",
    is_active: true,
    type: "",
    year_built: "",
    capacity: "",
    width: "",
    length: "",
    draft: "",
  });
  //kirus: Típus legördülős fix opxiók, port is és ne id alapján,(név alapján),férőhelyek is, ha van kedved currency is legyen választható az 1 éjszaka áránál.
  //user id-t nem kap az event stb ezek teljes átírást igényelnek
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await httpClient.post("api/newBoat", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      alert("Boat created successfully!");

      // Reset form
      setFormData({
        port_id: "",
        name: "",
        description: "",
        price_per_night: "",
        is_active: true,
        type: "",
        year_built: "",
        capacity: "",
        width: "",
        length: "",
        draft: "",
      });
    } catch (error) {
      console.error(error);
      alert("Error creating boat");
    }
  };

  return (
    <section className="add-boat">
      <div className="add-boat__header">
        <h1>Bérbe adom a hajómat</h1>
        <h2>Hajóm adatai</h2>
      </div>

      <form className="add-boat__form" onSubmit={handleSubmit}>
        <div className="add-boat__field">
          <label htmlFor="port_id">Port ID</label>
          <input
            type="number"
            id="port_id"
            name="port_id"
            value={formData.port_id}
            onChange={handleChange}
            required
          />
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
          <label htmlFor="type">Típus</label>
          <input
            type="text"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          />
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

        <button className="add-boat__submit" type="submit">
          Create Boat
        </button>
      </form>
    </section>
  );
};

export default AddBoat;
