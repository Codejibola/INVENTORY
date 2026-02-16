import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, allowedRole }) => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // 1. Not logged in? Go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. If an allowedRole is required, check if user.activeRole matches
  if (allowedRole && user.activeRole !== allowedRole) {
    // If they try to access Admin but are in Worker mode (or haven't picked yet)
    return <Navigate to="/select-mode" replace />;
  }

  return children;
};

export default PrivateRoute;