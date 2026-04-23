/* eslint-disable */
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Register from "./pages/Registration";
import Admin from "./pages/Admin";
import SelectMode from "./pages/SelectMode";
import ForgotPassword from "./pages/Forgot-Password";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider, useAuth } from "./context/AuthContext"; // Import useAuth
import ProtectedLayout from "./components/ProtectedLayout"; 
import LoginPopup from "./components/LoginPop"; // Your new popup component

// Admin pages
import Dashboard from "./pages/Dashboard";
import Manage_Products from "./pages/Manage_Products";
import Reports from "./pages/Reports";
import Receipts from "./pages/Receipts";
import RecordSales from "./pages/Record_Sales";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Notification from "./pages/Notification";
import Settings from "./pages/Settings";
import Feedback from "./pages/Feedback";
import Subscription from "./pages/Subscribtion";

// Worker pages
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerRecordSales from "./pages/WorkerRecordSales";
import AvailableProducts from "./pages/AvailableProducts";

import PrivateRoute from "./components/PrivateRoute";

/**
 * A wrapper component that only renders the LoginPopup listener
 * if the currently logged-in user has the 'admin' activeRole.
 */
const AdminNotificationWrapper = () => {
  const { user } = useAuth();
  
  return (
    <>
      {/* The popup only exists in the DOM for the Owner/Admin. 
          It listens to LocalStorage for 'jibs' or other worker logins.
      */}
      {user?.activeRole === "admin" && <LoginPopup />}
      <Outlet />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Admin />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* --- AUTHENTICATED (BUT NO ROLE YET) --- */}
          <Route element={<PrivateRoute />}> 
            <Route path="/select-mode" element={<SelectMode />} />
            <Route path="/subscription" element={<Subscription />} />
          </Route>

          {/* --- PROTECTED ROUTES WITH SUBSCRIPTION GUARD --- */}
          <Route element={<ProtectedLayout />}>

            {/* --- ADMIN GROUP (ONLY OWNER SEES POPUPS) --- */}
            <Route element={<PrivateRoute allowedRole="admin" />}>
              <Route element={<AdminNotificationWrapper />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/manage_products" element={<Manage_Products />} />
                <Route path="/recordSales" element={<RecordSales />} />
                <Route path="/receipts" element={<Receipts />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/notifications" element={<Notification />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* --- WORKER GROUP (CLEAN INTERFACE, NO POPUPS) --- */}
            <Route element={<PrivateRoute allowedRole="worker" />}>
              <Route path="/worker" element={<WorkerDashboard />}>
                <Route index element={<WorkerRecordSales />} />
                <Route path="record-sales" element={<WorkerRecordSales />} />
                <Route path="available-products" element={<AvailableProducts />} />
              </Route>
            </Route>

          </Route>

          {/* --- 404 CATCH-ALL --- */}
          <Route path="*" element={
            <div className="min-h-screen bg-black flex items-center justify-center">
               <h1 className="text-center text-white text-xl font-bold">404 – Page Not Found</h1>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}