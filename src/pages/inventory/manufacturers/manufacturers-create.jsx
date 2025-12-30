import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    FiArrowLeft,
    FiSave,
    FiUser,
    FiPhone,
    FiMail,
    FiMapPin,
    FiGlobe,
    FiFileText,
    FiAward,
    FiCheckSquare
} from "react-icons/fi";
import { MdOutlineFactory } from "react-icons/md";
import PageHeader from '@/components/shared/pageHeader/PageHeader';
import { useManufacturers } from "../../../contentApi/ManufacturersProvider";

const ManufacturersCreate = () => {
    const navigate = useNavigate();
    const { addManufacturer } = useManufacturers();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        reg_no: "",
        license_no: "",
        website: "",
        mp_certified: false,
        o_certified: false,
        address: "",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim()) {
            toast.error("Manufacturer name is required");
            return;
        }

        try {
            setLoading(true);
            await addManufacturer(form);
            toast.success("Manufacturer created successfully!");
            navigate("/inventory/manufacturers/manufacturers-list");
        } catch (error) {
            console.error("Error creating manufacturer:", error);
            // toast.error("Failed to create manufacturer");
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate("/inventory/manufacturers/manufacturers-list");
    };

    return (
        <>
            <PageHeader>
                <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="d-flex align-items-center">
                        <button
                            className="btn btn-outline-secondary me-3"
                            onClick={handleBack}
                        >
                            <FiArrowLeft className="me-2" />
                            Back
                        </button>
                    </div>
                </div>
            </PageHeader>

            <div className="main-content">
                <div className="row justify-content-center">
                    <div className="col-12 col-xl-10">
                        <div className="card">
                            <div className="card-header">
                                <h5 className="card-title mb-0 d-flex align-items-center">
                                    <MdOutlineFactory className="me-2" />
                                    Manufacturer Information
                                </h5>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-4">
                                        {/* Basic Information */}
                                        <div className="col-12">
                                            <h6 className="fw-bold mb-3 text-primary">
                                                <FiUser className="me-2" />
                                                Basic Information
                                            </h6>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">
                                                Manufacturer Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                className="form-control"
                                                value={form.name}
                                                onChange={handleChange}
                                                placeholder="Enter manufacturer name"
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Email</label>
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    <FiMail size={14} />
                                                </span>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    className="form-control"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    placeholder="manufacturer@example.com"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Phone</label>
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    <FiPhone size={14} />
                                                </span>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    className="form-control"
                                                    value={form.phone}
                                                    onChange={handleChange}
                                                    placeholder="+1 (555) 123-4567"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Website</label>
                                            <div className="input-group">
                                                <span className="input-group-text">
                                                    <FiGlobe size={14} />
                                                </span>
                                                <input
                                                    type="url"
                                                    name="website"
                                                    className="form-control"
                                                    value={form.website}
                                                    onChange={handleChange}
                                                    placeholder="https://www.example.com"
                                                />
                                            </div>
                                        </div>

                                        {/* Registration & License */}
                                        <div className="col-12 mt-4">
                                            <h6 className="fw-bold mb-3 text-info">
                                                <FiFileText className="me-2" />
                                                Registration & License Information
                                            </h6>
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Registration Number</label>
                                            <input
                                                type="text"
                                                name="reg_no"
                                                className="form-control"
                                                value={form.reg_no}
                                                onChange={handleChange}
                                                placeholder="REG123456789"
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">License Number</label>
                                            <input
                                                type="text"
                                                name="license_no"
                                                className="form-control"
                                                value={form.license_no}
                                                onChange={handleChange}
                                                placeholder="LIC123456789"
                                            />
                                        </div>

                                        {/* Certifications */}
                                        <div className="col-12 mt-4">
                                            <h6 className="fw-bold mb-3 text-success">
                                                <FiAward className="me-2" />
                                                Certifications
                                            </h6>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="mp_certified"
                                                    id="mp_certified"
                                                    checked={form.mp_certified}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label fw-medium" htmlFor="mp_certified">
                                                    <FiCheckSquare className="me-2" />
                                                    MP Certified
                                                </label>
                                                <small className="form-text text-muted d-block">
                                                    Manufacturing Practice Certification
                                                </small>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="checkbox"
                                                    name="o_certified"
                                                    id="o_certified"
                                                    checked={form.o_certified}
                                                    onChange={handleChange}
                                                />
                                                <label className="form-check-label fw-medium" htmlFor="o_certified">
                                                    <FiCheckSquare className="me-2" />
                                                    O Certified
                                                </label>
                                                <small className="form-text text-muted d-block">
                                                    Organic Certification
                                                </small>
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div className="col-12 mt-4">
                                            <h6 className="fw-bold mb-3 text-warning">
                                                <FiMapPin className="me-2" />
                                                Address Information
                                            </h6>
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-medium">Address</label>
                                            <textarea
                                                name="address"
                                                className="form-control"
                                                rows="3"
                                                value={form.address}
                                                onChange={handleChange}
                                                placeholder="Enter complete address"
                                            />
                                        </div>

                                        {/* Submit Buttons */}
                                        <div className="col-12 mt-4">
                                            <div className="d-flex gap-3 justify-content-end">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary px-4"
                                                    onClick={handleBack}
                                                    disabled={loading}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary px-4"
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Creating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FiSave className="me-2" />
                                                            Create Manufacturer
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManufacturersCreate;