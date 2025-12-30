import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./EditVaccineModal.css";

const EditVaccineModal = ({ vaccine, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    vaccine_name: "",
    age_group: "",
    dose_number: "",
    description: "",
    route_of_administration: "",
    site: "",
    min_age_days: "",
    max_age_days: "",
    mandatory: false,
    is_active: true,
    repeat_interval_days: "",
    id: null
  });

  useEffect(() => {
    if (vaccine) {
      setFormData({ ...vaccine });
    }
  }, [vaccine]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(`https://bkdemo1.clinicpro.cc/vaccination/edit-schedule/${formData.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Update failed");

      toast.success("Vaccine updated successfully");
      onSave(formData); // optional: trigger refresh in parent
    } catch (error) {
      console.log("Failed to update vaccine");
      // toast.error("Failed to update vaccine");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card edit-modal">
        <div className="card-body">
          <h4 className="card-title mb-4">Edit Vaccine</h4>

          <div className="mb-3">
            <label>Vaccine Name</label>
            <input
              type="text"
              className="form-control"
              name="vaccine_name"
              value={formData.vaccine_name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Age Group</label>
            <input
              type="text"
              className="form-control"
              name="age_group"
              value={formData.age_group}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Dose Number</label>
            <input
              type="number"
              className="form-control"
              name="dose_number"
              value={formData.dose_number}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Description</label>
            <textarea
              className="form-control"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Route of Administration</label>
            <input
              type="text"
              className="form-control"
              name="route_of_administration"
              value={formData.route_of_administration}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label>Site</label>
            <input
              type="text"
              className="form-control"
              name="site"
              value={formData.site}
              onChange={handleChange}
            />
          </div>

          <div className="row">
            <div className="col">
              <label>Min Age (Days)</label>
              <input
                type="number"
                className="form-control"
                name="min_age_days"
                value={formData.min_age_days}
                onChange={handleChange}
              />
            </div>
            <div className="col">
              <label>Max Age (Days)</label>
              <input
                type="number"
                className="form-control"
                name="max_age_days"
                value={formData.max_age_days}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="mb-3 mt-3">
            <label>Repeat Interval (Days)</label>
            <input
              type="number"
              className="form-control"
              name="repeat_interval_days"
              value={formData.repeat_interval_days}
              onChange={handleChange}
            />
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id="mandatoryCheck"
              name="mandatory"
              checked={formData.mandatory}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="mandatoryCheck">
              Mandatory
            </label>
          </div>

          <div className="form-check mb-4">
            <input
              className="form-check-input"
              type="checkbox"
              id="activeCheck"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="activeCheck">
              Active
            </label>
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button onClick={handleSubmit} className="btn btn-primary">
              Save Changes
            </button>
            <button onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVaccineModal;
