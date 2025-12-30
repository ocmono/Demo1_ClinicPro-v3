import React, { useState } from "react";
import { usePatient } from "../../context/PatientContext";
import CardHeader from "@/components/shared/CardHeader";
import CardLoader from "@/components/shared/CardLoader";
import { toast } from "react-toastify";
import { FaPlus, FaTimes } from "react-icons/fa";

const PatientsForm = ({ patient, mode, onClose }) => {
  const { addPatient, updatePatient } = usePatient();
  const [formData, setFormData] = useState(
    patient
      ? { ...patient, allergies: patient.allergies || [] }
      : {
          name: "",
          gender: "",
          age: "",
          email: "",
          contact: "",
          address: "",
          weight: "",
          bloodGroup: "",
          allergy: "",
          allergies: [], // Always initialize as array
        }
  );

  const [showImageUpload, setShowImageUpload] = useState(false);
  const [images, setImages] = useState([]);
  const [newAllergy, setNewAllergy] = useState("");

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for numeric fields
    if (name === "age" || name === "weight") {
      if (value === "" || /^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    // For contact number, allow only digits and max length 10
    if (name === "contact") {
      if (value === "" || (/^\d{0,10}$/.test(value) && value.length <= 10)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 2 - images.length);
      setImages((prev) => [...prev, ...filesArray]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData((prev) => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()],
      }));
      setNewAllergy("");
    }
  };

  const removeAllergy = (index) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.gender ||
      !formData.age ||
      !formData.email ||
      !formData.contact
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.contact.length !== 10) {
      toast.error("Contact number must be exactly 10 digits");
      return;
    }

    const ageNumber = parseInt(formData.age, 10);
    if (isNaN(ageNumber)) {
      toast.error("Please enter a valid age");
      return;
    }

    const dataToSubmit = {
      ...formData,
      age: ageNumber,
      weight: formData.weight ? parseInt(formData.weight, 10) : null,
      images: images,
    };

    try {
      if (mode === "edit") {
        updatePatient(dataToSubmit);
        toast.success("Patient updated successfully!");
      } else {
        addPatient(dataToSubmit);
        toast.success("Patient added successfully!");
      }
      onClose();
    } catch (error) {
      console.log(`Error ${mode === "edit" ? "updating" : "adding"} patient`)
      // toast.error(`Error ${mode === "edit" ? "updating" : "adding"} patient`);
    }
  };

  return (
    <div style={{ padding: "20px", width: "100%", minHeight: "100vh" }}>
      <div
        className="card stretch stretch-full"
        style={{
          height: "100%",
          backgroundColor: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <CardHeader
          title={mode === "edit" ? "Edit Patient" : "Add Patient"}
          children={
            <button
              onClick={onClose}
              style={{
                backgroundColor: "#636bff", // Indigo base color
                color: "white",
                border: "none",
                borderRadius: "50%", // Makes it circular
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                marginLeft: "auto",
                transition: "background-color 0.3s ease",
                fontWeight: "bold",
                fontSize: "16px",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#4f54cc")} // Darker on hover
              onMouseOut={(e) => (e.target.style.backgroundColor = "#636bff")}
            >
              x
            </button>
          }
        />
        <div
          className="card-body custom-card-action"
          style={{ height: "calc(100% - 60px)", padding: "20px" }}
        >
          <div
            style={{
              width: "100%",
              overflowY: "auto",
              maxHeight: "calc(100vh - 200px)",
            }}
          >
            <form
              onSubmit={handleSubmit}
              style={{
                width: "100%",
                backgroundColor: "#ffffff",
                fontFamily: "'Segoe UI', sans-serif",
              }}
            >
              <h3 style={{ marginBottom: "1.5rem", color: "#334155" }}>
                Basic Information
              </h3>

              {/* Name - Full row */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "1.5rem",
                  width: "100%",
                }}
              >
                <label style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                  Full Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Gender and Age - One row */}
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <label style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                    Gender *
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['Male', 'Female', 'Other'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, gender: g }))}
                        style={{
                          padding: '10px 16px',
                          border: formData.gender === g ? '2px solid #636bff' : '1px solid #ccc',
                          background: formData.gender === g ? '#636bff' : '#fff',
                          color: formData.gender === g ? '#fff' : '#333',
                          borderRadius: '4px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <label style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                    Age *
                  </label>
                  <input
                    type="text"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Age"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              {/* Email and Contact - One row */}
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <label style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <label style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="Contact Number"
                    required
                    maxLength={10}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              {/* Address - Full row */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginBottom: "1.5rem",
                  width: "100%",
                }}
              >
                <label style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Current Address"
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
              </div>

              <h3 style={{ marginBottom: "1.5rem", color: "#334155" }}>
                Medical Information
              </h3>

              {/* Weight and Blood Group - One row */}
              <div
                style={{
                  display: "flex",
                  gap: "1.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <label style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                    Weight (kg)
                  </label>
                  <input
                    type="text"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="Weight (kg)"
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div
                  style={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
                  <label style={{ marginBottom: "0.5rem", fontWeight: "500" }}>
                    Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">Select Blood Group</option>
                    {bloodGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Allergy - Special row with display */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  marginBottom: "1.5rem",
                  width: "100%",
                }}
              >
                {/* Input Section */}
                <div style={{ width: "100%" }}>
                  <label
                    style={{
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      display: "block",
                    }}
                  >
                    Allergy (if any)
                  </label>
                  <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      placeholder="Add allergy"
                      style={{
                        flex: 1,
                        padding: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={addAllergy}
                      style={{
                        backgroundColor: "#646cff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "0 12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                {/* Allergies List Section */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "8px",
                    width: "100%",
                  }}
                >
                  {(formData.allergies || []).map((allergy, index) => (
                    <div
                      key={index}
                      style={{
                        backgroundColor: "#e2e8f0",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "12px",
                      }}
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => removeAllergy(index)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    marginBottom: "0.5rem",
                    fontWeight: "500",
                    display: "block",
                  }}
                >
                  Do you want to add patient images?
                </label>
                <div
                  style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="radio"
                      name="imageUpload"
                      checked={showImageUpload}
                      onChange={() => setShowImageUpload(true)}
                    />
                    Yes
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="radio"
                      name="imageUpload"
                      checked={!showImageUpload}
                      onChange={() => setShowImageUpload(false)}
                    />
                    No
                  </label>
                </div>

                {showImageUpload && (
                  <div style={{ marginTop: "1rem" }}>
                    <label
                      style={{
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                        display: "block",
                      }}
                    >
                      Upload Images (Max 2)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={images.length >= 2}
                      style={{ marginBottom: "1rem" }}
                    />
                    <div
                      style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
                    >
                      {images.map((image, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            width: "100px",
                            height: "100px",
                            border: "1px dashed #ccc",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              background: "rgba(0,0,0,0.5)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                            }}
                          >
                            <FaTimes size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: "#646cff",
                  color: "#fff",
                  padding: "14px 20px",
                  fontSize: "1rem",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "100%",
                  fontWeight: "600",
                  transition: "background-color 0.3s",
                  marginTop: "1.5rem",
                }}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#535bf2")
                }
                onMouseOut={(e) => (e.target.style.backgroundColor = "#646cff")}
              >
                {mode === "edit" ? "Update Patient" : "Add Patient"}
              </button>
            </form>
          </div>
        </div>
        <CardLoader />
      </div>
    </div>
  );
};

export default PatientsForm;
