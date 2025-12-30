import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import PerfectScrollbar from 'react-perfect-scrollbar'
import PageHeaderSetting from '@/components/shared/pageHeader/PageHeaderSetting'
import Footer from '@/components/shared/Footer'
import { FiEye, FiEyeOff, FiLock, FiInfo } from 'react-icons/fi'

const ChangePasswordForm = () => {
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        confirm_password: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [saving, setSaving] = useState(false);
    const [usingRememberedPassword, setUsingRememberedPassword] = useState(false);

    const encryptPassword = (password) => {
        try {
            return btoa(unescape(encodeURIComponent(password)));
        } catch (error) {
            console.error('Encryption error:', error);
            return password;
        }
    };

    const decryptPassword = (encryptedPassword) => {
        try {
            return decodeURIComponent(escape(atob(encryptedPassword)));
        } catch (error) {
            console.error('Decryption error:', error);
            return encryptedPassword;
        }
    };

    useEffect(() => {
        loadRememberedPassword();
    }, []);

    const loadRememberedPassword = () => {
        try {
            // Check for remembered password in localStorage
            const rememberedPassword = localStorage.getItem("rememberedPassword");

            if (rememberedPassword) {
                const decryptedPassword = decryptPassword(rememberedPassword);
                if (decryptedPassword) {
                    setPasswordData(prev => ({
                        ...prev,
                        current_password: decryptedPassword
                    }));
                    setUsingRememberedPassword(true);
                    console.log('Remembered password loaded successfully');
                }
            } else {
                // Also check session storage as fallback
                const sessionPassword = sessionStorage.getItem("currentUserPassword");
                if (sessionPassword) {
                    const decryptedSessionPassword = decryptPassword(sessionPassword);
                    setPasswordData(prev => ({
                        ...prev,
                        current_password: decryptedSessionPassword
                    }));
                    setUsingRememberedPassword(true);
                    console.log('Session password loaded successfully');
                }
            }
        } catch (error) {
            console.error('Error loading remembered password:', error);
        }
    };


    const handleChange = e => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));

        // If user manually changes the current password, mark as not using remembered password
        if (name === 'current_password' && usingRememberedPassword) {
            setUsingRememberedPassword(false);
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const clearForm = () => {
        setPasswordData({
            current_password: '',
            new_password: '',
            confirm_password: ''
        });
        setUsingRememberedPassword(false);
    };

    const validateForm = () => {
        if (!passwordData.current_password.trim()) {
            toast.error('Current password is required');
            return false;
        }

        if (!passwordData.new_password.trim()) {
            toast.error('New password is required');
            return false;
        }

        if (passwordData.new_password.length < 6) {
            toast.error('New password must be at least 6 characters long');
            return false;
        }

        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error('New passwords do not match');
            return false;
        }

        if (passwordData.current_password === passwordData.new_password) {
            toast.error('New password must be different from current password');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        const token = localStorage.getItem("access_token");
        if (!token) {
            toast.error('Authentication token not found. Please log in again.');
            return;
        }

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('current_password', passwordData.current_password);
            formData.append('new_password', passwordData.new_password);
            formData.append('confirm_password', passwordData.confirm_password);

            console.log('Sending password change request:', formData);
            for (let [key, value] of formData.entries()) {
                console.log(`${key}: ${value}`);
            }

            const response = await fetch('https://bkdemo1.clinicpro.cc/users/change-password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            console.log('Response status:', response.status);

            if (response.status === 401) {
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('access_token');
                return;
            }

            if (response.ok) {
                const result = await response.json();
                console.log('Password change successful:', result);
                toast.success('Password changed successfully!');
                updateStoredPasswords(passwordData.new_password);
                clearForm();
            } else {
                let errorMessage = 'Failed to change password';
                try {
                    const errorData = await response.json();
                    console.log('Full error response:', JSON.stringify(errorData, null, 2));

                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.error) {
                        errorMessage = errorData.error;
                    } else if (errorData.errors) {
                        if (typeof errorData.errors === 'object') {
                            const validationErrors = Object.entries(errorData.errors)
                                .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                                .join('; ');
                            errorMessage = `Validation errors - ${validationErrors}`;
                        } else {
                            errorMessage = `Validation errors: ${errorData.errors}`;
                        }
                    } else {
                        errorMessage = `Server error: ${response.status} - ${JSON.stringify(errorData)}`;
                    }
                } catch (parseError) {
                    console.log('Could not parse error response:', parseError);
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error(`Failed to change password: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const updateStoredPasswords = (newPassword) => {
        try {
            const encryptedNewPassword = encryptPassword(newPassword);

            // Update remembered password in localStorage if it exists
            if (localStorage.getItem("rememberedPassword")) {
                localStorage.setItem("rememberedPassword", encryptedNewPassword);
                console.log('Updated remembered password in localStorage');
            }

            // Always update session storage
            sessionStorage.setItem("currentUserPassword", encryptedNewPassword);
            console.log('Updated password in sessionStorage');

        } catch (error) {
            console.error('Error updating stored passwords:', error);
        }
    };

    const reloadRememberedPassword = () => {
        loadRememberedPassword();
        toast.info('Reloaded remembered password');
    };


    return (
        <div className="content-area">
            <PerfectScrollbar>
                <PageHeaderSetting />
                <div className="content-area-body">
                    <div className="row">
                        <div className="col-12">
                            <div className="card stretch stretch-full">
                                <div className="card-header">
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="bg-primary rounded p-2">
                                            <FiLock size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h5 className="card-title mb-0">Change Password</h5>
                                            <small className="text-muted">Update your account password</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <div className="alert alert-info">
                                                <strong>Password Requirements:</strong>
                                                <ul className="mb-0 mt-1">
                                                    <li>Minimum 6 characters</li>
                                                    <li>New password must be different from current password</li>
                                                    <li>Confirm new password must match</li>
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Current Password */}
                                        <div className="col-12">
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <label className="form-label">
                                                    Current Password <span className="text-danger">*</span>
                                                </label>
                                                {usingRememberedPassword && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-info"
                                                        onClick={reloadRememberedPassword}
                                                        title="Reload remembered password"
                                                    >
                                                        <FiInfo size={14} className="me-1" />
                                                        Using Remembered Password
                                                    </button>
                                                )}
                                            </div>
                                            <div className="position-relative">
                                                <input
                                                    className="form-control"
                                                    name="current_password"
                                                    type={showPasswords.current ? "text" : "password"}
                                                    value={passwordData.current_password}
                                                    onChange={handleChange}
                                                    placeholder="Enter your current password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                    style={{ border: 'none', background: 'none' }}
                                                >
                                                    {showPasswords.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                                </button>
                                            </div>
                                            {usingRememberedPassword && (
                                                <div className="mt-1">
                                                    <small className="text-success">
                                                        <FiInfo size={12} className="me-1" />
                                                        Password pre-filled from "Remember Me"
                                                    </small>
                                                </div>
                                            )}
                                        </div>

                                        {/* New Password */}
                                        <div className="col-12">
                                            <label className="form-label">
                                                New Password <span className="text-danger">*</span>
                                            </label>
                                            <div className="position-relative">
                                                <input
                                                    className="form-control"
                                                    name="new_password"
                                                    type={showPasswords.new ? "text" : "password"}
                                                    value={passwordData.new_password}
                                                    onChange={handleChange}
                                                    placeholder="Enter your new password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    style={{ border: 'none', background: 'none' }}
                                                >
                                                    {showPasswords.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                                </button>
                                            </div>
                                            {passwordData.new_password && (
                                                <div className="mt-1">
                                                    <small className={passwordData.new_password.length >= 6 ? "text-success" : "text-danger"}>
                                                        {passwordData.new_password.length >= 6 ? '✓' : '✗'} Minimum 6 characters
                                                    </small>
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirm New Password */}
                                        <div className="col-12">
                                            <label className="form-label">
                                                Confirm New Password <span className="text-danger">*</span>
                                            </label>
                                            <div className="position-relative">
                                                <input
                                                    className="form-control"
                                                    name="confirm_password"
                                                    type={showPasswords.confirm ? "text" : "password"}
                                                    value={passwordData.confirm_password}
                                                    onChange={handleChange}
                                                    placeholder="Confirm your new password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    style={{ border: 'none', background: 'none' }}
                                                >
                                                    {showPasswords.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                                </button>
                                            </div>
                                            {passwordData.confirm_password && (
                                                <div className="mt-1">
                                                    <small className={passwordData.new_password === passwordData.confirm_password ? "text-success" : "text-danger"}>
                                                        {passwordData.new_password === passwordData.confirm_password ? '✓' : '✗'} Passwords match
                                                    </small>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12">
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleSave}
                                                    disabled={saving}
                                                >
                                                    {saving ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Changing Password...
                                                        </>
                                                    ) : (
                                                        'Change Password'
                                                    )}
                                                </button>
                                                <button
                                                    className="btn btn-outline-secondary"
                                                    onClick={clearForm}
                                                    disabled={saving}
                                                    type="button"
                                                >
                                                    Clear Form
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </PerfectScrollbar>
        </div>
    );
};

export default ChangePasswordForm;