import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loader from "../ui/Loader";

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (user) {
    // Redirect to user's profile instead of dashboard
    const from =
      location.state?.from?.pathname || `/${user.username || user.name}`;
    return <Navigate to={from} replace />;
  }

  return children;
}
