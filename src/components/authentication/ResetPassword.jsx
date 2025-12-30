import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("access_token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ Add these toggles
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("https://bkdemo1.clinicpro.cc/users/reset-password", {
                token: token,
                new_password: password,
            });

            if (res.status === 200) {
                toast.success("Password reset successful. Please log in.");
                navigate("/authentication/login");
            }
        } catch (error) {
            console.error("Reset error", error);
            toast.error(error.response?.data?.detail || "Failed to reset password. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-creative-wrapper">
            <div className="auth-creative-inner">
                <div className="creative-card-wrapper">
                    <div className="card my-4 overflow-hidden" style={{ zIndex: 1 }}>
                        <div className="row flex-1 g-0">
                            {/* Left side form */}
                            <div className="col-lg-6 h-100 my-auto">
                                <div className="wd-50 bg-white p-2 rounded-circle shadow-lg position-absolute translate-middle top-50 start-50">
                                    <img src="/images/logo-clinicpro.png" alt="logo" className="img-fluid" />
                                </div>
                                <div className="creative-card-body card-body p-sm-5">
                                    <h2 className="fs-20 fw-bolder mb-4">Reset Password</h2>
                                    <h4 className="fs-13 fw-bold mb-2">Create your new password</h4>
                                    <p className="fs-12 fw-medium text-muted">
                                        Enter your new password below to regain access to your account.
                                    </p>

                                    <form onSubmit={handleSubmit} className="w-100 mt-4 pt-2">
                                        {/* New Password */}
                                        <div className="mb-3 input-group">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="form-control"
                                                placeholder="New Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => setShowPassword(!showPassword)}
                                                tabIndex={-1}
                                            >
                                                {showPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="mb-3 input-group">
                                            <input
                                                type={showConfirmPassword ? "text" : "password"}
                                                className="form-control"
                                                placeholder="Confirm Password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                tabIndex={-1}
                                            >
                                                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                        </div>

                                        <div className="mt-4 d-flex flex-column gap-2">
                                            <button
                                                type="submit"
                                                className="btn btn-lg btn-primary w-100"
                                                disabled={loading}
                                            >
                                                {loading ? "Resetting..." : "Reset Password"}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-lg btn-outline-secondary w-100"
                                                onClick={() => navigate("/authentication/login")}
                                            >
                                                Back to Login
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Right side image */}
                            <div className="col-lg-6 bg-primary">
                                <div className="h-100 d-flex align-items-center justify-content-center">
                                    <img src="/images/auth/auth-user.png" alt="auth" className="img-fluid" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ResetPassword;
