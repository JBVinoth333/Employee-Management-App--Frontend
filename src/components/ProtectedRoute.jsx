import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { BASE_URL } from '../config';

export default function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    // Check if user has valid session via cookie
    fetch(`${BASE_URL}/api/validateSession`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  // Loading state
  if (isAuthenticated === null) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated - show dashboard
  return children;
}
