import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contentApi/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure authentication state is properly loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user || !token) {
    // Redirect to login page with the current location as state
    // This allows us to redirect back to the intended page after login
    return <Navigate to="/authentication/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children
  return children;
};

export default ProtectedRoute; 