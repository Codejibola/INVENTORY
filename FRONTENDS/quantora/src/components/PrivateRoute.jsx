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



// import { Navigate, useLocation } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const PrivateRoute = ({ children, allowedRole }) => {
//   const { user, loading } = useAuth();
//   const location = useLocation();

//   // 1. Loading State
//   if (loading) {
//     return (
//       <div className="h-screen bg-[#0A0A0B] flex items-center justify-center">
//         <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   // 2. Authentication Check
//   if (!user) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // 3. Role Check (Admin vs Worker mode)
//   if (allowedRole && user.activeRole !== allowedRole) {
//     return <Navigate to="/select-mode" replace />;
//   }

//   // 4. THE GLOBAL SUBSCRIPTION LOCK
//   const isExpired = user.subscription_expiry && new Date(user.subscription_expiry) < new Date();
//   const isInactive = user.subscription_status !== "active";
  
//   // Define restricted paths (Everything except the billing and settings pages)
//   const isRestrictedPath = !["/subscription", "/settings", "/login", "/select-mode"].includes(location.pathname);

//   if ((isInactive || isExpired) && isRestrictedPath) {
//     // If a Worker is blocked, we send them to a "Subscription Required" info page 
//     // or back to select-mode, since they can't pay themselves.
//     if (user.activeRole === "worker") {
//        return <Navigate to="/select-mode" replace />;
//     }
//     // If Admin is blocked, send to payment page
//     return <Navigate to="/subscription" replace />;
//   }

//   return children;
// };

// export default PrivateRoute;