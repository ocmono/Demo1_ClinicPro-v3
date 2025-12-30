import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const EditVaccinePatientModal = ({ vaccine, onClose, onSave }) => {
    const [formData, setFormData] = useState({
    patient_name: "",
    dob: "",
    gender: "",
    parent_name: "",
    contact_number: "",
    address: "",
    birth_weight: "",
    registration_date: "",
    notes: "",
    doctor_id: "",
    status: "",
    schedule_id: "",
    id: null,
  });

  useEffect(() => {
    if (vaccine) {
      setFormData({ ...vaccine });
    }
  }, [vaccine]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
        onSave(formData);
        toast.success("Patient vaccine record updated successfully");
        onClose();
    } catch (error) {
      console.log("Failed to update patient vaccine data");
      // toast.error("Failed to update patient vaccine data");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="card edit-modal">
        <div className="card-body">
          <h4 className="card-title mb-4">Edit Patient Vaccine</h4>
          {[
            { label: "Patient Name", name: "patient_name", disabled: false },
            { label: "Date of Birth", name: "dob", type: "date" , disabled: true},
            { label: "Gender", name: "gender", type: "select", options: ["Male", "Female"], disabled: true },
            { label: "Parent Name", name: "parent_name" },
            { label: "Contact Number", name: "contact_number", disabled: false },
            { label: "Address", name: "address" },
            { label: "Birth Weight", name: "birth_weight", type: "number", disabled: true },
            { label: "Registration Date", name: "registration_date", type: "datetime-local", disabled: true },
            { label: "Notes", name: "notes", type: "textarea" },
            { label: "Status", name: "status", type: "select", options:["pending","completed"] },
          ].map(({ label, name, type = "text", options, disabled = false }) => (
            <div className="mb-3" key={name}>
              <label>{label}</label>
              {type === "textarea" ? (
                      <textarea className="form-control" name={name} value={formData[name]} onChange={handleChange} disabled={disabled} />
              ) : type === "select" ? (
                <select className="form-control" name={name} value={formData[name]} onChange={handleChange} disabled={disabled}>
                  <option value="">Select</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <input className="form-control" type={type} name={name} value={formData[name]} onChange={handleChange} disabled={disabled}/>
              )}
            </div>
          ))}

          {/* Doctor ID and Schedule ID should be select fields, ideally populated from props */}
          <div className="d-flex justify-content-end gap-2">
            <button onClick={handleSubmit} className="btn btn-primary">Save Changes</button>
            <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditVaccinePatientModal;
