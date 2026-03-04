/* eslint-disable */
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Loading State
  if (loading) {
    return (
      <div className="h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Authentication Check
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Role Check (Admin vs Worker mode)
  // We keep this so the app knows which dashboard to show
  if (allowedRole && user.activeRole !== allowedRole) {
    return <Navigate to="/select-mode" replace />;
  }

  // 4. THE GLOBAL SUBSCRIPTION LOCK (TEMPORARILY DISABLED)
  /* const isExpired = user.subscription_expiry && new Date(user.subscription_expiry) < new Date();
  const isInactive = user.subscription_status !== "active";
  
  const isRestrictedPath = !["/subscription", "/settings", "/login", "/select-mode"].includes(location.pathname);

  if ((isInactive || isExpired) && isRestrictedPath) {
    if (user.activeRole === "worker") {
       return <Navigate to="/select-mode" replace />;
    }
    return <Navigate to="/subscription" replace />;
  }
  */

  // 5. Render children (for single routes) OR Outlet (for group routes)
  return children ? children : <Outlet />;
};

export default PrivateRoute;