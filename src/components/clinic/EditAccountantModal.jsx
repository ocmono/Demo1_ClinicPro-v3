import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiSave, FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiAward, FiInfo } from 'react-icons/fi';
import { useAccountant } from "../../context/AccountantContext";

const EditAccountantModal = ({ isOpen, onClose, accountant }) => {
    const { editAccountant } = useAccountant();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        status: 'Active',
        accountant_profile: {
            qualification: "",
            experience: "",
        },
    });

    // Initialize form data when accountant prop changes
    useEffect(() => {
        if (accountant) {
            setFormData({
                firstName: accountant.firstName || "",
                lastName: accountant.lastName || "",
                email: accountant.email || "",
                phone: accountant.phone || "",
                status: accountant.status ? "Active" : "Inactive",
                accountant_profile: {
                    qualification: accountant.accountant_profile?.qualification || "",
                    experience: accountant.accountant_profile?.experience || "",
                },
            });
        }
    }, [accountant, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (["qualification", "experience"].includes(name)) {
            setFormData((prev) => ({
            ...prev,
                accountant_profile: {
                    ...prev.accountant_profile,
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

        // Client-side validation
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setSaving(true);
        try {
            // Shape payload exactly as backend expects
            const payload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                phone: formData.phone ? String(formData.phone).trim() : "",
                status: formData.status === "Active",
                accountant_profile: {   
                    qualification: formData.accountant_profile.qualification || null,
                    experience: formData.accountant_profile.experience || null,
                }
            };

            await editAccountant(accountant.id, payload);
            toast.success('Accountant updated successfully!');
            onClose();
        } catch (err) {
            toast.error(err?.message || 'Failed to update accountant');
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
                            Edit Accountant Profile
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
                                {/* Personal Information Section */}
                                <div className="col-12">
                                    <h6 className="fw-semibold mb-3 text-primary">
                                        <FiUser className="me-2" />
                                        Personal Information
                                    </h6>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">
                                            First Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            className="form-control"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="Enter first name"
                                            required
                                        />
                                        <div className="form-text">
                                            <FiInfo size={14} className="me-1" />
                                            Enter the accountant's first name
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">
                                            Last Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            className="form-control"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Enter last name"
                                            required
                                        />
                                        <div className="form-text">
                                            <FiInfo size={14} className="me-1" />
                                            Enter the accountant's last name
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information Section */}
                                <div className="col-12">
                                    <h6 className="fw-semibold mb-3 text-primary">
                                        <FiPhone className="me-2" />
                                        Contact Information
                                    </h6>
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
                                        <div className="form-text">
                                            <FiInfo size={14} className="me-1" />
                                            This email will be used for login and notifications
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">Phone</label>
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
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        <div className="form-text">
                                            <FiInfo size={14} className="me-1" />
                                            Enter contact phone number
                                        </div>
                                    </div>
                                </div>

                                {/* Professional Information Section */}
                                <div className="col-12">
                                    <h6 className="fw-semibold mb-3 text-primary">
                                        <FiAward className="me-2" />
                                        Professional Information
                                    </h6>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">Qualification</label>
                                        <select
                                            name="qualification"
                                            className="form-select"
                                            value={formData.accountant_profile?.qualification || ""}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select Qualification</option>
                                            <option value="CA">Chartered Accountant (CA)</option>
                                            <option value="CPA">Certified Public Accountant (CPA)</option>
                                            <option value="ACCA">Association of Chartered Certified Accountants (ACCA)</option>
                                            <option value="B.Com">Bachelor of Commerce (B.Com)</option>
                                            <option value="M.Com">Master of Commerce (M.Com)</option>
                                            <option value="MBA">Master of Business Administration (MBA)</option>
                                            <option value="Other">Other</option>
                                        </select>
                                        <div className="form-text">
                                            <FiInfo size={14} className="me-1" />
                                            Select the accountant's professional qualification
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">Experience (Years)</label>
                                        <input
                                            type="text"
                                            name="experience"
                                            className="form-control"
                                            value={formData.accountant_profile?.experience || ""}
                                            onChange={handleChange}
                                            placeholder="Enter years of experience"
                                            min="0"
                                            max="50"
                                        />
                                        <div className="form-text">
                                            <FiInfo size={14} className="me-1" />
                                            Total years of professional experience
                                        </div>
                                    </div>
                                </div>

                                {/* Status Section */}
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
                                        <div className="form-text">
                                            <FiInfo size={14} className="me-1" />
                                            Active accountants can access the system
                                        </div>
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
                            disabled={saving}
                        >
                            <FiX size={16} className="me-2" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? (
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

export default EditAccountantModal;