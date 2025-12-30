import React, { useEffect, useState } from "react";
import {
    FiX,
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
import { toast } from "react-toastify";
import { useManufacturers } from "../../../contentApi/ManufacturersProvider";

const ManufacturersEditModal = ({ isOpen, onClose, manufacturerId }) => {
    const { manufacturers, editManufacturer } = useManufacturers();
    const manufacturer = manufacturers.find((m) => String(m.id) === String(manufacturerId));
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

    useEffect(() => {
        if (manufacturer) {
            setForm({
                name: manufacturer.name || "",
                email: manufacturer.email || "",
                phone: manufacturer.phone || "",
                reg_no: manufacturer.reg_no || "",
                license_no: manufacturer.license_no || "",
                website: manufacturer.website || "",
                mp_certified: manufacturer.mp_certified || false,
                o_certified: manufacturer.o_certified || false,
                address: manufacturer.address || "",
            });
        }
    }, [manufacturer]);

    if (!isOpen) return null;

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
            await editManufacturer(manufacturerId, form);
            toast.success("Manufacturer updated successfully!");
            onClose();
        } catch (error) {
            console.error("Error updating manufacturer:", error);
            // toast.error("Failed to update manufacturer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
                <div className="modal-content">
                    {/* Header */}
                    <div className="modal-header border-0">
                        <h5 className="modal-title fw-bold d-flex align-items-center">
                            <MdOutlineFactory className="me-2" /> Edit Manufacturer
                        </h5>
                        <button className="btn-close" onClick={onClose} disabled={loading}></button>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                {/* Basic Information */}
                                <div className="col-12">
                                    <h6 className="fw-bold mb-3 text-primary">
                                        <FiUser className="me-2" /> Basic Information
                                    </h6>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-medium">Manufacturer Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        value={form.name}
                                        onChange={handleChange}
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
                                        />
                                    </div>
                                </div>

                                {/* Registration & License */}
                                <div className="col-12 mt-4">
                                    <h6 className="fw-bold mb-3 text-info">
                                        <FiFileText className="me-2" /> Registration & License Information
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
                                    />
                                </div>

                                {/* Certifications */}
                                <div className="col-12 mt-4">
                                    <h6 className="fw-bold mb-3 text-success">
                                        <FiAward className="me-2" /> Certifications
                                    </h6>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-check">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            name="mp_certified"
                                            id="mp_certified_edit"
                                            checked={form.mp_certified}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label fw-medium" htmlFor="mp_certified_edit">
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
                                            id="o_certified_edit"
                                            checked={form.o_certified}
                                            onChange={handleChange}
                                        />
                                        <label className="form-check-label fw-medium" htmlFor="o_certified_edit">
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
                                        <FiMapPin className="me-2" /> Address Information
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
                                    />
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="modal-footer border-0">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            <FiX size={16} className="me-1" />
                            Cancel
                        </button>
                        <button
                            className="btn btn-primary"
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FiSave size={16} className="me-1" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManufacturersEditModal;