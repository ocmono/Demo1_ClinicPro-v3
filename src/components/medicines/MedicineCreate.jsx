import React, { useState } from 'react';

const MedicineCreate = ({ onCreate }) => {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    variations: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onCreate) onCreate(form);
    setForm({ name: '', brand: '', variations: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Medicine Name</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label>Brand</label>
        <input
          type="text"
          name="brand"
          value={form.brand}
          onChange={handleChange}
        />
      </div>
      <div>
        <label>Variations</label>
        <input
          type="text"
          name="variations"
          value={form.variations}
          onChange={handleChange}
          placeholder="e.g. 500mg, 250mg"
        />
      </div>
      <button type="submit">Create Medicine</button>
    </form>
  );
};

export default MedicineCreate; 