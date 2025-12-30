import { Navigate } from "react-router-dom";
import { useAuth } from "../contentApi/AuthContext";

const InitialRedirect = () => {
  const { user, token } = useAuth();

  // If we have both user and token, redirect to dashboard
  if (user && token) {
    return <Navigate to="/" replace />;
  }

  // Otherwise redirect to login
  return <Navigate to="/authentication/login" replace />;
};

export default InitialRedirect;
