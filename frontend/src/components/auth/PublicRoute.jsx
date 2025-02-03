import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingFallback from "../LoadingFallback";
import { Suspense } from "react";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingFallback />;
  }

  if (user) {
    // Redirect to user's profile instead of dashboard
    const from =
      location.state?.from?.pathname || `/${user.username || user.name}`;
    return <Navigate to={from} replace />;
  }

  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}
