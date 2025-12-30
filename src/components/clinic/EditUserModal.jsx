import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiX, FiSave, FiUser, FiMail, FiPhone, FiLock, FiCalendar, FiUserCheck } from 'react-icons/fi';
import { useUsers } from '../../context/UserContext';

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        firstName: '',
        lastName: '',
        role: '',
        phone: '',
        password: '',
        age: '',
        ageType: 'years',
        gender: '',
        status: 'active',
        dob: ''
    });

    // Get updateUser function from context
    const { updateUser } = useUsers();

    // Initialize form data when user prop changes
    useEffect(() => {
        if (user) {
            let numericAge = '';
            let ageType = 'years';
            if (user.age) {
                const ageString = String(user.age);
                // Handle different age formats: "25 years", "6 months", "15 days"
                if (ageString.includes('days')) {
                    numericAge = ageString.replace('days', '').trim();
                    ageType = 'days';
                } else if (ageString.includes('months')) {
                    numericAge = ageString.replace('months', '').trim();
                    ageType = 'months';
                } else if (ageString.includes('years')) {
                    numericAge = ageString.replace('years', '').trim();
                    ageType = 'years';
                } else {
                    // If no unit specified, assume years
                    numericAge = ageString;
                    ageType = 'years';
                }
            }
            setFormData({
                email: user.email || '',
                username: user.username || '',
                firstName: user.firstName || user.first_name || '',
                lastName: user.lastName || user.last_name || '',
                role: user.role || '',
                phone: user.phone || '',
                password: '',
                age: numericAge,
                ageType: ageType,
                gender: user.gender ? user.gender.toLowerCase() : '',
                status: user.status ? 'active' : 'inactive',
                dob: user.dob || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle date of birth change and auto-calculate age
    const handleDobChange = (e) => {
        const dobValue = e.target.value;

        setFormData(prev => ({
            ...prev,
            dob: dobValue
        }));

        // Calculate age based on DOB
        if (dobValue) {
            const birthDate = new Date(dobValue);
            let calculatedAge = "";
            let calculatedAgeType = "years";

            if (!isNaN(birthDate)) {
                const today = new Date();
                const birthYear = birthDate.getFullYear();
                const birthMonth = birthDate.getMonth();
                const currentYear = today.getFullYear();
                const currentMonth = today.getMonth();
                const currentDate = today.getDate();
                const birthDateOfMonth = birthDate.getDate();

                // Calculate age in months
                const ageInMonths = (currentYear - birthYear) * 12 + (currentMonth - birthMonth);

                // Calculate age in days for very young infants
                const timeDiff = today.getTime() - birthDate.getTime();
                const ageInDays = Math.floor(timeDiff / (1000 * 3600 * 24));

                if (ageInDays <= 30) {
                    // If less than or equal to 30 days, show in days
                    calculatedAge = ageInDays.toString();
                    calculatedAgeType = "days";
                } else if (ageInMonths < 24) {
                    // If less than 2 years, show in months
                    calculatedAge = ageInMonths.toString();
                    calculatedAgeType = "months";

                    // Check if born in current month - show in days
                    if (currentYear === birthYear && currentMonth === birthMonth) {
                        calculatedAge = ageInDays.toString();
                        calculatedAgeType = "days";
                    }
                    // Check if born in current year but not current month
                    else if (currentYear === birthYear) {
                        calculatedAge = ageInMonths.toString();
                        calculatedAgeType = "months";
                    }
                } else {
                    // If 2 years or more, show in years
                    let ageInYears = currentYear - birthYear;

                    // Adjust if birthday hasn't occurred yet this year
                    if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDate < birthDateOfMonth)) {
                        ageInYears--;
                    }

                    calculatedAge = ageInYears.toString();
                    calculatedAgeType = "years";
                }
            }

            setFormData(prev => ({
                ...prev,
                age: calculatedAge,
                ageType: calculatedAgeType
            }));
        } else {
            // Clear age if DOB is cleared
            setFormData(prev => ({
                ...prev,
                age: "",
                ageType: "years"
            }));
        }
    };

    const handleAgeChange = (field, value) => {
        if (field === 'age') {
            setFormData(prev => ({
                ...prev,
                age: value
            }));
        } else if (field === 'ageType') {
            setFormData(prev => ({
                ...prev,
                ageType: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user?.id) {
            toast.error('No user selected for update');
            return;
        }
        setLoading(true);

        try {
            let formattedAge = "";
            if (formData.age && formData.ageType) {
                if (formData.ageType === 'days') {
                    formattedAge = `${formData.age} days`;
                } else if (formData.ageType === 'months') {
                    formattedAge = `${formData.age} months`;
                } else {
                    formattedAge = `${formData.age} years`;
                }
            }
            // Prepare the data for API (matching edit-user.jsx format)
            const updatePayload = {
                email: formData.email.trim(),
                username: formData.username.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                role: formData.role,
                phone: formData.phone.trim(),
                password: formData.password.trim(),
                age: formattedAge,
                gender: formData.gender,
                // status: formData.status
            };

            if (formData.password.trim()) {
                updatePayload.password = formData.password.trim();
            } else {
                // Remove empty password to avoid updating it if not changed
                delete updatePayload.password;
            }


            // Remove empty password to avoid updating it if not changed
            if (!updatePayload.password) {
                delete updatePayload.password;
            }

            // Remove age if empty or invalid
            if (!updatePayload.age || updatePayload.age.trim() === '') {
                delete updatePayload.age;
            }

            console.log('Updating user with data:', updatePayload);

            // Use the updateUser function from context
            const updatedUser = await updateUser(user.id, updatePayload);
            console.log('User updated successfully:', updatedUser);

            toast.success('User updated successfully!');
            // Call the onSave callback to refresh the parent component
            if (onSave) {
                onSave(updatedUser); // Pass the updated user data
            }

            // Close the modal
            onClose();
        } catch (error) {
            console.error('Error updating user:', error);
            if (error.response?.status === 422) {
                toast.error('Validation error: Please check your input data');
            } else {
                toast.error('Failed to update user');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const getRoleBadgeColor = (role) => {
        const roleColors = {
            'super_admin': 'danger',
            'clinic_admin': 'warning',
            // 'admin': 'info',
            'doctor': 'primary',
            'receptionist': 'success',
            'accountant': 'secondary',
            // 'pharmacist': 'info',
            'patient': 'light'
        };
        return roleColors[role] || 'secondary';
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">
                            <FiUser size={20} className="me-2 text-primary" />
                            Edit User Profile
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
                            <div className="row g-3">
                                {/* First Name */}
                                <div className="col-md-6">
                                    <label htmlFor="firstName" className="form-label fw-medium">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="Enter first name"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Last Name */}
                                <div className="col-md-6">
                                    <label htmlFor="lastName" className="form-label fw-medium">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Enter last name"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Username */}
                                <div className="col-md-6">
                                    <label htmlFor="username" className="form-label fw-medium">
                                        Username 
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter username"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Email */}
                                <div className="col-md-6">
                                    <label htmlFor="email" className="form-label fw-medium">
                                        Email
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FiMail size={14} />
                                        </span>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter email address"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="col-md-6">
                                    <label htmlFor="phone" className="form-label fw-medium">
                                        Phone
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FiPhone size={14} />
                                        </span>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label htmlFor="dob" className="form-label fw-medium">
                                        Date of Birth
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FiCalendar size={14} />
                                        </span>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="dob"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleDobChange}
                                            placeholder="Enter date of birth"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-medium">
                                        Age
                                    </label>
                                    <div className="row g-2">
                                        <div className="col-8">
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder={formData.ageType === 'days' ? 'Age in days' : formData.ageType === 'months' ? 'Age in months' : 'Age in years'}
                                                value={formData.age}
                                                onChange={(e) => handleAgeChange('age', e.target.value)}
                                                min="0"
                                                max={formData.ageType === 'days' ? "365" : formData.ageType === 'months' ? "240" : "120"}
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="col-4">
                                            <select
                                                className="form-select"
                                                value={formData.ageType}
                                                onChange={(e) => handleAgeChange('ageType', e.target.value)}
                                                disabled={loading}
                                            >
                                                <option value="years">Years</option>
                                                <option value="months">Months</option>
                                                <option value="days">Days</option>
                                            </select>
                                        </div>
                                    </div>
                                    <small className="text-muted">
                                        {formData.ageType === 'days'
                                            ? 'Auto-calculated for infants under 1 month'
                                            : formData.ageType === 'months'
                                                ? 'Auto-calculated for children under 2 years'
                                                : 'Auto-calculated for ages 2 years and above'
                                        }
                                    </small>
                                </div>

                                {/* Gender */}
                                <div className="col-md-6">
                                    <label htmlFor="gender" className="form-label fw-medium">
                                        Gender
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FiUserCheck size={14} />
                                        </span>
                                        <select
                                            className="form-select"
                                            id="gender"
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            disabled={loading}
                                        >
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer_not_to_say">Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="col-md-6">
                                    <label htmlFor="password" className="form-label fw-medium">
                                        Password
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <FiLock size={14} />
                                        </span>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter new password (leave blank to keep current)"
                                            disabled={loading}
                                        />
                                    </div>
                                    <small className="text-muted">
                                        Leave blank if you don't want to change the password
                                    </small>
                                </div>

                                {/* Role */}
                                <div className="col-md-6">
                                    <label htmlFor="role" className="form-label fw-medium">
                                        Role
                                    </label>
                                    <select
                                        className="form-select"
                                        id="role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="">Select Role</option>
                                        <option value="super_admin">Super Admin</option>
                                        <option value="clinic_admin">Clinic Admin</option>
                                        {/* <option value="admin">Admin</option> */}
                                        <option value="doctor">Doctor</option>
                                        <option value="receptionist">Receptionist</option>
                                        <option value="accountant">Accountant</option>
                                        {/* <option value="pharmacist">Pharmacist</option> */}
                                        <option value="patient">Patient</option>
                                    </select>
                                </div>

                                {/* Role Display */}
                                {/* <div className="col-md-6">
                                    <label className="form-label fw-medium">
                                        Current Role
                                    </label>
                                    <div className="form-control-plaintext">
                                        <span className={`badge bg-${getRoleBadgeColor(formData.role)}`}>
                                            {formData.role?.replace('_', ' ').toUpperCase() || 'Not Assigned'}
                                        </span>
                                        <small className="text-muted d-block mt-1">
                                            Use the role manager to change user roles
                                        </small>
                                    </div>
                                </div> */}

                                {/* Status */}
                                <div className="col-md-6">
                                    <label className="form-label fw-medium">
                                        Current Status
                                    </label>
                                    <div className="form-control-plaintext">
                                        <span className={`badge ${formData.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                                            {formData.status?.toUpperCase()}
                                        </span>
                                        <small className="text-muted d-block mt-1">
                                            Status changes might require a separate API call
                                        </small>
                                    </div>
                                </div>

                                {/* Status */}
                                {/* <div className="col-md-6">
                                    <label htmlFor="status" className="form-label fw-medium">
                                        Status
                                    </label>
                                    <select
                                        className="form-select"
                                        id="status"
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                        <option value="suspended">Suspended</option>
                                    </select>
                                </div> */}
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

export default EditUserModal;