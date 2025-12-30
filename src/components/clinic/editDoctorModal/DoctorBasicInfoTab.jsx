// DoctorBasicInfoTab.jsx
import React from "react";
import { FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

const DoctorBasicInfoTab = ({
    formData,
    handleChange,
    showPassword,
    setShowPassword,
    confirmPassword,
    setConfirmPassword,
    showConfirmPassword,
    setShowConfirmPassword
}) => {
    return (
        <div className="row g-3">
            {/* First Name */}
            <div className="col-md-6">
                <label className="form-label fw-medium">First Name *</label>
                <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* Last Name */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Last Name *</label>
                <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* Email */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Email *</label>
                <div className="input-group">
                    <span className="input-group-text">
                        <FiMail size={14} />
                    </span>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            {/* Phone */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Phone *</label>
                <div className="input-group">
                    <span className="input-group-text">
                        <FiPhone size={14} />
                    </span>
                    <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>

            {/* Gender */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Gender</label>
                <select
                    className="form-select"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* Status */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Status</label>
                <select
                    className="form-select"
                    name="status"
                    value={formData.status ? "true" : "false"}
                    onChange={handleChange}
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            <div className="col-md-6">
                <label className="form-label">
                    Date of Birth
                </label>
                <input
                    type="date"
                    name="dob"
                    className="form-control"
                    value={formData.dob || ""}
                    onChange={handleChange}
                />
            </div>

            {/* Password */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Password</label>
                <div className="input-group">
                    <span className="input-group-text">
                        <FiLock size={14} />
                    </span>
                    <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                    >
                        {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                </div>
                <small className="text-muted">
                    Leave blank if you don’t want to change password
                </small>
            </div>

            {/* Confirm Password */}
            <div className="col-md-6">
                <label className="form-label fw-medium">Confirm Password</label>
                <div className="input-group">
                    <span className="input-group-text">
                        <FiLock size={14} />
                    </span>
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                    />
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                    >
                        {showConfirmPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorBasicInfoTab;
