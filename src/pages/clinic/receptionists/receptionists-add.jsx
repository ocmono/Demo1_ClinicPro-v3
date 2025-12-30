import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useReceptionist } from "../../../context/ReceptionistContext";
import { toast } from "react-toastify";
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import Footer from '@/components/shared/Footer';
import { FiArrowLeft, FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiInfo } from 'react-icons/fi';

const AddReceptionist = ({ onClose }) => {
  const navigate = useNavigate();
  const { addReceptionist, receptionists } = useReceptionist();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    age: "",
    address: "",
    gender: "Male",
  });
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (formData.email) {
      const emailExists = receptionists.some(
        (r) => r.email.toLowerCase() === formData.email.toLowerCase()
      );
      if (emailExists) {
        setEmailError("Email is already registered");
      } else {
        setEmailError("");
      }
    } else {
      setEmailError("");
    }
  }, [formData.email, receptionists]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      if (value === "" || (/^\d{0,10}$/.test(value) && value.length <= 10)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "age") {
      if (value === "" || (/^\d{0,3}$/.test(value) && value.length <= 3)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.age
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (emailError) {
      toast.error("Please enter a unique email");
      return;
    }

    if (formData.mobile.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits");
      return;
    }

    const ageNumber = parseInt(formData.age, 10);
    if (isNaN(ageNumber) || ageNumber <= 0) {
      toast.error("Please enter a valid age");
      return;
    }

    try {
      addReceptionist({
        ...formData,
        mobile: formData.mobile,
        age: ageNumber,
      });
      toast.success("Receptionist added successfully!");
      setFormData({
        name: "",
        email: "",
        mobile: "",
        age: "",
        address: "",
        gender: "Male",
      });
      if (onClose) {
        onClose();
      } else {
        navigate('/clinic/receptionists');
      }
    } catch (error) {
      toast.error("Error adding receptionist");
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/clinic/receptionists');
    }
  };

  return (
    <>
      <PageHeader>
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button 
              className="btn btn-icon btn-light"
              onClick={handleCancel}
            >
              <FiArrowLeft />
            </button>
            <div>
              <h4 className="mb-1 fw-bold">Add New Receptionist</h4>
              <p className="text-muted mb-0">Create a new receptionist profile</p>
            </div>
          </div>
        </div>
      </PageHeader>
      
      <div className="main-content">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-light border-bottom">
                <div className="d-flex align-items-center">
                  <div className="avatar-text user-avatar-text avatar-lg me-3 bg-primary">
                    <FiUser size={24} className="text-white" />
                  </div>
                  <div>
                    <h5 className="mb-1 fw-bold">Receptionist Information</h5>
                    <p className="text-muted mb-0">Enter the receptionist details</p>
                  </div>
                </div>
              </div>
              
              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          className="form-control"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          required
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Enter the complete name of the receptionist
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Email <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          className={`form-control ${emailError ? "is-invalid" : ""}`}
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter email address"
                          required
                        />
                        {emailError && <div className="invalid-feedback">{emailError}</div>}
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          This email will be used for login and notifications
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Mobile <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          name="mobile"
                          className="form-control"
                          value={formData.mobile}
                          onChange={handleChange}
                          placeholder="Enter 10-digit mobile number"
                          required
                          maxLength={10}
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Enter exactly 10 digits without country code
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">
                          Age <span className="text-danger">*</span>
                        </label>
                        <input
                          type="number"
                          name="age"
                          className="form-control"
                          value={formData.age}
                          onChange={handleChange}
                          placeholder="Enter age"
                          min={18}
                          max={100}
                          required
                        />
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Minimum age requirement is 18 years
                        </div>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="form-group">
                        <label className="form-label fw-medium">Address</label>
                        <input
                          type="text"
                          name="address"
                          className="form-control"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Enter complete address"
                        />
                        <div className="form-text">
                          <FiMapPin size={14} className="me-1" />
                          Enter the full residential address
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label fw-medium">Gender</label>
                        <select
                          name="gender"
                          className="form-select"
                          value={formData.gender}
                          onChange={handleChange}
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <div className="form-text">
                          <FiInfo size={14} className="me-1" />
                          Select the appropriate gender option
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex gap-3 mt-4 pt-4 border-top">
                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={emailError}
                    >
                      <FiSave size={16} className='me-2' />
                      Add Receptionist
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={handleCancel}
                    >
                      <FiX size={16} className='me-2' />
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddReceptionist;
