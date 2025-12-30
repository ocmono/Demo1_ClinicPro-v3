import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiSave, FiBriefcase, FiInfo } from 'react-icons/fi';
import { useClinicManagement } from '../../contentApi/ClinicMnanagementProvider';

const EditSpecialtyModal = ({ isOpen, onClose, specialty, onSave }) => {
    const { updateSpeciality } = useClinicManagement();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        speciality: '',
        description: '',
        category: 'Medical',
        appointmentDuration: '30',
        requirements: '',
        status: 'Active',
    });

    // hydrate form when modal opens or specialty changes
    useEffect(() => {
        if (isOpen && specialty) {
            setFormData({
                speciality: specialty.speciality ?? '',
                description: specialty.description ?? '',
                category: specialty.category ?? 'Medical',
                appointmentDuration: String(specialty.appointmentDuration ?? '30'),
                requirements: specialty.requirements ?? '',
                status: specialty.status ?? 'Active',
            });
        }
    }, [isOpen, specialty]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        // validation
        const name = formData.speciality.trim();
        if (!name) return toast.error('Please enter a specialty name');
        if (name.length < 3) return toast.error('Specialty name must be at least 3 characters long');
        if (formData.description && formData.description.trim().length > 500)
            return toast.error('Description cannot exceed 500 characters');
        if (formData.requirements && formData.requirements.trim().length > 300)
            return toast.error('Requirements cannot exceed 300 characters');

        const payload = {
            ...formData,
            speciality: name,
            description: (formData.description || '').trim(),
            requirements: (formData.requirements || '').trim(),
            // keep as string for select; convert to number if your API requires:
            // appointmentDuration: Number(formData.appointmentDuration)
        };

        try {
            setLoading(true);
            const updated = await updateSpeciality(specialty.id, payload);
            toast.success('Specialty updated successfully!');
            if (onSave) onSave(updated);
            onClose();
        } catch (err) {
            console.error('Error updating specialty:', err);
            if (user.role === "super_admin") {
                toast.error('Failed to update specialty');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <FiBriefcase size={20} className="me-2 text-primary" />
                            Edit Specialty
                        </h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            disabled={loading}
                        ></button>
                    </div>

                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-4">
                                <div className="col-12">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">
                                            Specialty Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="speciality"
                                            className="form-control"
                                            value={formData.speciality}
                                            onChange={handleChange}
                                            placeholder="Enter specialty name (e.g., Cardiology, Neurology)"
                                            required
                                        />
                                        <div className="form-text">
                                            <FiInfo size={14} className="me-1" />
                                            Enter the full name of the medical specialty
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">Description</label>
                                        <textarea
                                            name="description"
                                            className="form-control"
                                            rows={4}
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Enter a detailed description of the specialty, including common conditions treated and procedures performed"
                                        />
                                        <div className="d-flex justify-content-between">
                                            <div className="form-text">
                                                <FiInfo size={14} className="me-1" />
                                                Provide a comprehensive description of the specialty
                                            </div>
                                            <small className="text-muted">
                                                {formData.description.length}/500 characters
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">Category</label>
                                        <select
                                            name="category"
                                            className="form-select"
                                            value={formData.category}
                                            onChange={handleChange}
                                        >
                                            <option value="Medical">Medical</option>
                                            <option value="Surgical">Surgical</option>
                                            <option value="Diagnostic">Diagnostic</option>
                                            <option value="Therapeutic">Therapeutic</option>
                                            <option value="Preventive">Preventive</option>
                                        </select>
                                        <div className="form-text">
                                            <FiInfo size={14} className="me-1" />
                                            Select the primary category for this specialty
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">Default Appointment Duration</label>
                                        <select
                                            name="appointmentDuration"
                                            className="form-select"
                                            value={formData.appointmentDuration}
                                            onChange={handleChange}
                                        >
                                            <option value="15">15 minutes</option>
                                            <option value="30">30 minutes</option>
                                            <option value="45">45 minutes</option>
                                            <option value="60">1 hour</option>
                                            <option value="90">1.5 hours</option>
                                            <option value="120">2 hours</option>
                                        </select>
                                        <div className="form-text">
                                            <FiInfo size={14} className="me-1" />
                                            Typical duration for appointments in this specialty
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className="form-group">
                                        <label className="form-label fw-medium">Prerequisites & Requirements</label>
                                        <textarea
                                            name="requirements"
                                            className="form-control"
                                            rows={3}
                                            value={formData.requirements}
                                            onChange={handleChange}
                                            placeholder="Enter any specific requirements, qualifications, or prerequisites for this specialty"
                                        />
                                        <div className="d-flex justify-content-between">
                                            <div className="form-text">
                                                <FiInfo size={14} className="me-1" />
                                                List any special requirements or qualifications needed
                                            </div>
                                            <small className="text-muted">
                                                {formData.requirements.length}/300 characters
                                            </small>
                                        </div>
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
                                            <option value="Pending">Pending</option>
                                        </select>
                                        <div className="form-text">
                                            <FiInfo size={14} className="me-1" />
                                            Active specialties will be available for doctor assignment
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
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FiSave size={16} className="me-2" />
                                    Update Specialty
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditSpecialtyModal;