import { useAuth } from "../../context/AuthContext";
import LoadingFallback from "../LoadingFallback";
import { Suspense } from "react";

export default function UnprotectedRoute({ children }) {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}
