import React, { useState } from 'react';
import axios from 'axios';
import { toast } from "react-toastify";
import { Link } from 'react-router-dom'

const ResetForm = ({ path }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post("https://bkdemo1.clinicpro.cc/users/forgot-password", {
                email,
            });

            if (res.status === 200) {
                toast.success("Password reset link has been sent to your email");
            }
        } catch (error) {
            console.error("Reset error", error);
            toast.error(
                error.response?.data?.detail ||
                "Failed to send reset link. Please try again."
            )
        } finally {
            setLoading(false);
        }
    }
    return (
        <>
            <h2 className="fs-20 fw-bolder mb-4">Reset</h2>
            <h4 className="fs-13 fw-bold mb-2">Reset to your username/password</h4>
            <p className="fs-12 fw-medium text-muted">Enter your email and a reset link will sent to you, let's
                access our the best recommendation for you.</p>
            <form onSubmit={handleSubmit} className="w-100 mt-4 pt-2">
                <div className="mb-4">
                    <input className="form-control" type="email" id="email" placeholder="you@example.com" value={email || ""} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mt-5">
                    <button type="submit" className="btn btn-lg btn-primary w-100" disabled={loading}>{loading ? "Sending..." : "Reset Now"}</button>
                </div>
            </form>
            {/* <div className="mt-5 text-muted">
                <span> Don't have an account?</span>
                <Link to={path} className="fw-bold"> Create an Account</Link>
            </div> */}
        </>
    )
}

export default ResetForm