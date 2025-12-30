import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import PageHeaderSetting from "../shared/pageHeader/PageHeaderSetting";
import Footer from "../shared/Footer";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useAuth } from "../../contentApi/AuthContext";

const UserSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // 🔵 Added — Edit mode
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        id: "",
        user_id: "",
        max_users_per_phone: "",
        max_users_per_email: "",
        preferences: {},
    });

    // Backup original values for Cancel button
    const [originalData, setOriginalData] = useState(null); // 

    useEffect(() => {
        fetchUserSettings();
    }, [user]);

    const fetchUserSettings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(
                "https://bkdemo1.clinicpro.cc/user-settings/all-users-settings",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) throw new Error("Failed to fetch user settings");
            const data = await response.json();

            let record = null;

            if (Array.isArray(data)) {
                record = data[0] || null;
            } else if (typeof data === "object" && data !== null) {
                record = data;
            }

            if (record) {
                setFormData({
                    id: record.id,
                    user_id: record.user_id,
                    max_users_per_phone: record.max_users_per_phone,
                    max_users_per_email: record.max_users_per_email,
                    preferences: record.preferences || {},
                });

                setOriginalData({
                    max_users_per_phone: record.max_users_per_phone,
                    max_users_per_email: record.max_users_per_email,
                    preferences: record.preferences || {},
                }); // Save original
            }
        } catch (error) {
            console.log("Failed to load user settings");
            // toast.error("Failed to load user settings");
        } finally {
            setLoading(false);
        }
    };

    // Enable editing
    const handleEdit = () => {
        setIsEditing(true);
    };

    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        setFormData(prev => ({
            ...prev,
            ...originalData,
        }));
    };

    // Save changes (update API)
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("access_token");

            const payload = {
                max_users_per_phone: Number(formData.max_users_per_phone),
                max_users_per_email: Number(formData.max_users_per_email),
                preferences: formData.preferences,
            };

            const response = await fetch(
                `https://bkdemo1.clinicpro.cc/user-settings/update-users-settings/${formData.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) throw new Error("Failed to update settings");

            toast.success("Settings updated successfully!");

            setIsEditing(false);
            setOriginalData(payload);
        } catch (error) {
            console.error(error);
            // toast.error("Update failed!");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="content-area setting-form">
            <PerfectScrollbar>
                <PageHeaderSetting />
                <div className="content-area-body">
                    <div className="row">
                        {/* Left Section */}
                        <div className="col-lg-8">
                            <div className="card">
                                <div className="card-header d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="card-title mb-0">User Registration Limits</h5>
                                        <p className="text-muted mb-0">
                                            Configuration of maximum users allowed per phone number and email address
                                        </p>
                                    </div>

                                    {!isEditing ? (
                                        <button className="btn btn-primary btn-sm" onClick={handleEdit}>
                                            Edit
                                        </button>
                                    ) : (
                                        <div className="d-flex gap-2">
                                            <button className="btn btn-success btn-sm" onClick={handleSave}>
                                                Save
                                            </button>
                                            <button className="btn btn-secondary btn-sm" onClick={handleCancel}>
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="card-body">
                                    <div>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Max Users Per Phone Number</label>
                                                    <input
                                                        type="number"
                                                        name="max_users_per_phone"
                                                        className="form-control"
                                                        value={formData.max_users_per_phone}
                                                        onChange={handleChange}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-md-6">
                                                <div className="mb-3">
                                                    <label className="form-label">Max Users Per Email Address</label>
                                                    <input
                                                        type="number"
                                                        name="max_users_per_email"
                                                        className="form-control"
                                                        value={formData.max_users_per_email}
                                                        onChange={handleChange}
                                                        disabled={!isEditing}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Additional Preferences (JSON)</label>
                                            <textarea
                                                rows="3"
                                                className="form-control"
                                                value={JSON.stringify(formData.preferences, null, 2)}
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Section */}
                        <div className="col-lg-4">
                            <div className="card">
                                <div className="card-header">
                                    <h5 className="card-title mb-0">Information</h5>
                                </div>
                                <div className="card-body">
                                    <div className="alert alert-info">
                                        <h6 className="alert-heading">About User Limits</h6>
                                        <p>
                                            These settings help prevent spam and multiple registrations using same contact info.
                                        </p>
                                        <hr />
                                        <h6>Current Settings:</h6>
                                        <ul className="list-unstyled mb-0">
                                            <li>📱 <strong>{formData.max_users_per_phone}</strong> per phone</li>
                                            <li>📧 <strong>{formData.max_users_per_email}</strong> per email</li>
                                        </ul>
                                    </div>

                                    <div className="alert alert-warning">
                                        <h6 className="alert-heading">Best Practices</h6>
                                        <ul className="small mb-0">
                                            <li>Set reasonable limits to prevent spam.</li>
                                            <li>Review user behavior periodically.</li>
                                            <li>Adjust values based on real usage trends.</li>
                                        </ul>
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

export default UserSettings;
