import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { FullPageSpinner } from "../components/ui/Spinner";

/**
 * Guards a route by auth status AND role. A logged-in donor hitting
 * /hospital gets redirected to their own dashboard rather than a bare
 * 403 — wrong-role access is a routing mistake, not an auth failure.
 */
export function ProtectedRoute({ children, allowedRole }) {
  const { status, role } = useAuthStore();
  const location = useLocation();

  if (status === "idle" || status === "loading") {
    return <FullPageSpinner />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === "donor" ? "/donor" : "/hospital"} replace />;
  }

  return children;
}