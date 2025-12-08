import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    // User not logged in, redirect to login page
    return <Navigate to="/admin" replace />;
  }

  return children;
}
