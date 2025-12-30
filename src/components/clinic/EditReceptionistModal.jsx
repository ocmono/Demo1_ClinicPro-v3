import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiSave, FiUser, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useReceptionist } from "../../context/ReceptionistContext";

const EditReceptionistModal = ({ isOpen, onClose, receptionist }) => {
    const { editReceptionist } = useReceptionist();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        status: true,
        receptionist_profile: {
            address: "",
            qualification: ""
        }
    });

    // Initialize form data when receptionist prop changes
    useEffect(() => {
        if (receptionist) {
            setFormData({
                firstName: receptionist.firstName || "",
                lastName: receptionist.lastName || "",
                email: receptionist.email || '',
                phone: receptionist.phone || '',
                age: receptionist.age?.toString() || "",
                gender: receptionist.gender || "",
                status: receptionist.status ? "Active" : "Inactive",
                receptionist_profile: {
                    address: receptionist.receptionist_profile?.address || "",
                    qualification: receptionist.receptionist_profile?.qualification || ""
                } 
            });
        }
    }, [receptionist, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (["address", "qualification"].includes(name)) {
            setFormData((prev) => ({
                ...prev,
                receptionist_profile: {
                    ...prev.receptionist_profile,
                    [name]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (saving) return;

        // Client-side sanity checks (optional but helpful)
        if (!/^\d{10}$/.test(String(formData.phone).trim())) {
            toast.error('Mobile must be a 10-digit number');
            return;
        }

        setSaving(true);
        try {
            // Shape payload exactly as backend expects
            const payload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phone: String(formData.phone).trim(),
                age: formData.age,
                gender: formData.gender,
                status: formData.status === "Active", // Convert back to boolean
                receptionist_profile: {
                    address: formData.receptionist_profile.address.trim(),
                    qualification: formData.receptionist_profile.qualification.trim()
                }
            // If your backend supports status in update, uncomment next line
            // status: formData.status
            };
            console.log("Sending payload:", payload);
            await editReceptionist(receptionist.id, payload);
            toast.success('Receptionist updated successfully!');
            onClose();
        } catch (err) {
            toast.error(err?.message || 'Failed to update receptionist');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <FiUser size={20} className="me-2 text-primary" />
                            Edit Receptionist Profile
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={saving}
                        ></button>
                    </div>

                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        className="form-control"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Enter first name"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-medium">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        className="form-control"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Enter last name"
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">
                                            Email <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <FiMail size={14} />
                                            </span>
                                            <input
                                                type="email"
                                                name="email"
                                                className="form-control"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Enter email address"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">
                                            Mobile <span className="text-danger">*</span>
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <FiPhone size={14} />
                                            </span>
                                            <input
                                                type="tel"
                                                name="phone"
                                                className="form-control"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="Enter 10-digit mobile number"
                                                required
                                                maxLength={10}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">
                                            Age <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="age"
                                            className="form-control"
                                            value={formData.age}
                                            onChange={handleChange}
                                            placeholder="Enter age"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">Qualification</label>
                                        <input
                                            type="text"
                                            name="qualification"
                                            className="form-control"
                                            value={formData.receptionist_profile.qualification}
                                            onChange={handleChange}
                                            placeholder="Enter qualification"
                                        />
                                    </div>
                                </div>


                                <div className="col-12">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">Address</label>
                                        <div className="input-group">
                                            <span className="input-group-text">
                                                <FiMapPin size={14} />
                                            </span>
                                            <input
                                                type="text"
                                                name="address"
                                                className="form-control"
                                                value={formData.receptionist_profile.address}
                                                onChange={handleChange}
                                                placeholder="Enter complete address"
                                            />
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
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">Status</label>
                                        <select
                                            name="status"
                                            className="form-select"
                                            value={formData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            <FiX size={16} className="me-2" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FiSave size={16} className="me-2" />
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

export default EditReceptionistModal;