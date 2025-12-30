import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import "@/components/authentication/LoginForm.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../contentApi/AuthContext.jsx";
import { useUsers } from "../../context/UserContext.jsx";

const LoginForm = ({ registerPath, resetPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState(() => localStorage.getItem("rememberedUsername") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("rememberedPassword") || "");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem("rememberedUsername"));
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login } = useAuth();
  const { loginUser } = useUsers();

  // --------------------------------------------
  // GOOGLE LOGIN HANDLER
  // --------------------------------------------
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsGoogleLoading(true);
      const decoded = jwtDecode(credentialResponse.credential);

      const payload = { token: credentialResponse.credential };

      const res = await fetch(`https://bkdemo1.clinicpro.cc/users/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.detail || "Google login failed");
        setIsGoogleLoading(false);
        return;
      }

      // Store token
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);

      // Create user object
      const userObject = {
        username: data.user?.username || decoded.email,
        name: data.user?.name || decoded.name,
        id: data.user?.id,
        role: data.user?.role || "user"
      };

      login(userObject, data.access_token);
      toast.success("Google Login Successful!");

      // Welcome modal
      localStorage.setItem("cp_show_welcome", "1");
      localStorage.setItem("cp_welcome_name", userObject.name);

      const from = location.state?.from?.pathname || "/";
      setTimeout(() => navigate(from, { replace: true }), 1200);

    } catch (err) {
      console.error("Google Auth Error:", err);
      toast.error("Google authentication error");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Login failed");
  };

  // --------------------------------------------
  // NORMAL LOGIN HANDLER
  // --------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser({ username, password });

      if (data?.access_token) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("token_type", data.token_type);

        const userObject = {
          username,
          role: data.user_role,
          id: data.user_id,
          name: username,
        };

        login(userObject, data.access_token);
        toast.success("Login successful!");

        localStorage.setItem("cp_show_welcome", "1");
        localStorage.setItem("cp_welcome_name", userObject.name);

        if (rememberMe) {
          localStorage.setItem("rememberedUsername", username);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedUsername");
          localStorage.removeItem("rememberedPassword");
        }

        const from = location.state?.from?.pathname || "/";
        setTimeout(() => navigate(from, { replace: true }), 1500);
      } else {
        setError(data.detail || "Login failed.");
        toast.error("Oops! Username or password is incorrect.");
      }
    } catch (err) {
      setError("Something went wrong while connecting to the server.");
      console.error(err);
    }
  };

  return (
    <>
      <h2 className="fs-20 fw-bolder mb-4 main-text">Login</h2>
      <h4 className="sub-text fw-bold mb-2">Login to your account</h4>
      <p className="fs-12 fw-medium text-muted">
        Thank you for coming back to <strong>ClinicPro</strong>.
      </p>

      <form onSubmit={handleSubmit} className="w-100 mt-4 pt-2">
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <div className="input-group">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {error && <p className="text-danger fs-12 mb-3">{error}</p>}

        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="custom-control custom-checkbox">
            <input
              type="checkbox"
              id="rememberMe"
              className="custom-control-input"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label className="custom-control-label c-pointer" htmlFor="rememberMe">
              Remember Me
            </label>
          </div>

          <Link to={resetPath} className="fs-11 text-primary">
            Forget password?
          </Link>
        </div>

        <button type="submit" className="btn btn-lg btn-primary w-100 mt-2">
          Login
        </button>

        <div className="text-center my-3 fw-bold text-muted">OR</div>

        {/* ---------------- GOOGLE LOGIN BUTTON ---------------- */}
        <div className="d-flex justify-content-center mb-2">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            shape="pill"
            size="large"
            width="280"
            logo_alignment="center"
          />
        </div>

        {isGoogleLoading && (
          <p className="text-center text-primary mt-2">Connecting to Google...</p>
        )}
      </form>
    </>
  );
};

export default LoginForm;
