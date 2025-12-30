import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiUpload } from 'react-icons/fi';

const EditProfileModal = ({ isOpen, onClose, clinicData, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        gst_no: '',
        logo: ''
    });
    const [logoPreview, setLogoPreview] = useState('');
    const [saving, setSaving] = useState(false);
    const [hasNewLogo, setHasNewLogo] = useState(false);
    const [existingLogoUrl, setExistingLogoUrl] = useState('');

    useEffect(() => {
        console.log('Clinic data received in modal:', clinicData);
        if (clinicData) {
            setFormData({
                name: clinicData.name || '',
                email: clinicData.email || '',
                phone: clinicData.phone || '',
                address: clinicData.address || '',
                website: clinicData.website || '',
                gst_no: clinicData.gst || clinicData.gst_no || '',
                logo: clinicData.logo || ''
            });
            setLogoPreview(clinicData.logo || '');
            setExistingLogoUrl(clinicData.logo || '');
            setHasNewLogo(false); // Reset when loading existing data
        }
    }, [clinicData]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFormData(prev => ({ ...prev, logo: file }));
        setHasNewLogo(true); // Mark that we have a new logo

        const reader = new FileReader();
        reader.onload = (ev) => {
            setLogoPreview(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Clinic name is required');
            return;
        }

        const token = localStorage.getItem("access_token");
        if (!token) {
            console.log('Authentication token not found. Please log in again.');
            // toast.error('Authentication token not found. Please log in again.');
            return;
        }

        setSaving(true);

        try {
            // Common headers
            const jsonHeaders = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            };

            const formDataHeaders = {
                'Authorization': `Bearer ${token}`,
            };

            // Check if we're creating new or updating existing
            const isNewClinic = !clinicData?.id;
            const endpoint = isNewClinic
                ? 'https://bkdemo1.clinicpro.cc/clinic-details/add'
                : `https://bkdemo1.clinicpro.cc/clinic-details/update/${clinicData.id}`;

            const method = isNewClinic ? 'POST' : 'PUT';

            console.log(`${isNewClinic ? 'Creating' : 'Updating'} clinic:`, formData);
            console.log('Has new logo:', hasNewLogo);
            console.log('Existing logo URL:', existingLogoUrl);

            let response;

            // For new clinics OR when updating with a new logo, use FormData
            if (isNewClinic || hasNewLogo) {
                console.log('Using FormData...');

                // Use FormData for file upload
                const formDataPayload = new FormData();
                formDataPayload.append('name', formData.name.trim());

                // Add other fields only if they have values
                if (formData.address?.trim()) {
                    formDataPayload.append('address', formData.address.trim());
                }
                if (formData.phone?.trim()) {
                    formDataPayload.append('phone', formData.phone.trim());
                }
                if (formData.email?.trim()) {
                    formDataPayload.append('email', formData.email.trim());
                }
                if (formData.website?.trim()) {
                    formDataPayload.append('website', formData.website.trim());
                }
                if (formData.gst_no?.trim()) {
                    formDataPayload.append('gst_no', formData.gst_no.trim());
                }

                // Add the image file only if it's a File object (new logo)
                if (formData.logo instanceof File) {
                    formDataPayload.append('logo', formData.logo);
                } else if (existingLogoUrl && !hasNewLogo) {
                    // If we have an existing logo URL and no new logo, include it
                    // Some APIs accept the existing URL to maintain the logo
                    formDataPayload.append('logo_url', existingLogoUrl);
                }

                response = await fetch(endpoint, {
                    method: method,
                    headers: formDataHeaders,
                    body: formDataPayload,
                });
            } else {
                console.log('Using JSON without logo update...');

                // Prepare the data payload WITHOUT logo for updates without new image
                const payload = {
                    name: formData.name.trim(),
                };

                // Add other fields only if they have values
                if (formData.address?.trim()) {
                    payload.address = formData.address.trim();
                }
                if (formData.phone?.trim()) {
                    payload.phone = formData.phone.trim();
                }
                if (formData.email?.trim()) {
                    payload.email = formData.email.trim();
                }
                if (formData.website?.trim()) {
                    payload.website = formData.website.trim();
                }
                if (formData.gst_no?.trim()) {
                    payload.gst_no = formData.gst_no.trim();
                }
                if (existingLogoUrl && existingLogoUrl.trim()) {
                    payload.logo = existingLogoUrl.trim();
                    console.log('Including existing logo URL in payload');
                }
                // IMPORTANT: Do NOT include the logo field when updating without new image
                // The backend expects UploadFile but we only have a string URL
                console.log('Payload (without logo):', payload);

                response = await fetch(endpoint, {
                    method: method,
                    headers: jsonHeaders,
                    body: JSON.stringify(payload),
                });

                // If JSON fails, try alternative approach
                if (!response.ok && response.status === 422) {
                    console.log('JSON failed, trying alternative approach...');

                    // Option 1: Try with empty logo field
                    const payloadWithoutLogo = { ...payload };
                    delete payloadWithoutLogo.logo;

                    console.log('Payload (without logo):', payloadWithoutLogo);
                    response = await fetch(endpoint, {
                        method: method,
                        headers: jsonHeaders,
                        body: JSON.stringify(payloadWithoutLogo),
                    });

                    // If still failing, try FormData with empty logo
                    if (!response.ok) {
                        console.log('Alternative JSON failed, trying FormData with empty logo...');

                        const formDataPayload = new FormData();
                        Object.keys(payloadWithoutLogo).forEach(key => {
                            if (payloadWithoutLogo[key] !== undefined && payloadWithoutLogo[key] !== null) {
                                formDataPayload.append(key, payloadWithoutLogo[key]);
                            }
                        });
                        // Add empty logo field to satisfy the API
                        if (existingLogoUrl) {
                            // Option 1: Try with logo_url field
                            formDataPayload.append('logo_url', existingLogoUrl);
                        }

                        response = await fetch(endpoint, {
                            method: method,
                            headers: formDataHeaders,
                            body: formDataPayload,
                        });

                        if (!response.ok) {
                            console.log('FormData failed, trying with empty logo field...');

                            const finalFormData = new FormData();
                            Object.keys(payloadWithoutLogo).forEach(key => {
                                if (payloadWithoutLogo[key] !== undefined && payloadWithoutLogo[key] !== null) {
                                    finalFormData.append(key, payloadWithoutLogo[key]);
                                }
                            });
                            finalFormData.append('logo', '');

                            response = await fetch(endpoint, {
                                method: method,
                                headers: formDataHeaders,
                                body: finalFormData,
                            });
                        }
                    }
                }
            }

            console.log('Response status:', response.status);

            // Handle unauthorized response
            if (response.status === 401) {
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('access_token');
                return;
            }

            if (response.ok) {
                const result = await response.json();
                console.log('Success response:', result);

                toast.success(isNewClinic ? 'Clinic profile created successfully!' : 'Profile updated successfully!');

                // Call the update callback with the response data
                if (onUpdate) {
                    onUpdate(result);
                }

                onClose();
            } else {
                // Get detailed error information
                let errorMessage = `Failed to ${isNewClinic ? 'create' : 'update'} profile`;
                try {
                    const errorData = await response.json();
                    console.log('Error response:', errorData);

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
                    } else if (errorData.detail) {
                        // Handle the specific logo error
                        if (Array.isArray(errorData.detail)) {
                            const logoError = errorData.detail.find(d => d.loc && d.loc.includes('logo'));
                            if (logoError) {
                                errorMessage = 'Logo format error. Please try uploading the logo again or contact support.';
                            } else {
                                errorMessage = errorData.detail.map(d => d.msg || d.type).join(', ');
                            }
                        } else {
                            errorMessage = errorData.detail;
                        }
                    } else {
                        errorMessage = `Server error: ${response.status}`;
                    }
                } catch (parseError) {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            // toast.error(`Failed to save profile: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        if (!saving) {
            onClose();
        }
    };

    // Function to remove logo (in case user wants to remove existing logo)
    const handleRemoveLogo = () => {
        setFormData(prev => ({ ...prev, logo: '' }));
        setLogoPreview('');
        setHasNewLogo(false);
        setExistingLogoUrl('');
    };

    if (!isOpen) return null;

    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Edit Clinic Profile</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleClose}
                            disabled={saving}
                        ></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row g-3">
                                <div className="col-12 text-center mb-3">
                                    <div className="position-relative d-inline-block">
                                        <div className="wd-100 ht-100 rounded-circle overflow-hidden border border-3 border-gray-3">
                                            <img
                                                src={logoPreview || "/images/avatar/1.png"}
                                                alt="Logo Preview"
                                                className="img-fluid"
                                                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                            />
                                        </div>
                                        <label className="position-absolute bottom-0 end-0 btn btn-sm btn-primary rounded-circle p-1">
                                            <FiUpload size={14} />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={handleLogoChange}
                                                disabled={saving}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-muted mt-2 mb-0">Click to upload logo</p>
                                    {logoPreview && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger mt-1"
                                            onClick={handleRemoveLogo}
                                            disabled={saving}
                                        >
                                            Remove Logo
                                        </button>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">
                                        Clinic Name <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter clinic name"
                                        required
                                        disabled={saving}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email address"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Website</label>
                                    <input
                                        type="url"
                                        className="form-control"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="Enter website URL (e.g., www.example.com)"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        className="form-control"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        rows="2"
                                        placeholder="Enter clinic address"
                                        disabled={saving}
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label">GST/Registration Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="gst_no"
                                        value={formData.gst_no}
                                        onChange={handleChange}
                                        placeholder="Enter GST or registration number"
                                        disabled={saving}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleClose}
                                disabled={saving}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FiSave className="me-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfileModal;