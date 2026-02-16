import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Registration";
import Admin from "./pages/Admin";
import SelectMode from "./pages/SelectMode";
import ForgotPassword from "./pages/Forgot-Password";
import ResetPassword from "./pages/ResetPassword"; // The professional reset page we created

// Admin pages
import Dashboard from "./pages/Dashboard";
import Manage_Products from "./pages/Manage_Products";
import Invoices from "./pages/Invoices";
import RecordSales from "./pages/Record_Sales";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Notification from "./pages/Notification";
import Settings from "./pages/Settings";
import Feedback from "./pages/Feedback";

// Worker pages
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerRecordSales from "./pages/WorkerRecordSales";
import AvailableProducts from "./pages/AvailableProducts";

import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Root → Login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Admin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        
        {/* The Reset Password Route (Handles the secure token from email) */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Mode selection */}
        <Route
          path="/select-mode"
          element={
            <PrivateRoute>
              <SelectMode />
            </PrivateRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/manage_products"
          element={
            <PrivateRoute>
              <Manage_Products />
            </PrivateRoute>
          }
        />

        <Route
          path="/Settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />

        <Route
          path="/invoices"
          element={
            <PrivateRoute>
              <Invoices />
            </PrivateRoute>
          }
        />
        <Route
          path="/recordSales"
          element={
            <PrivateRoute>
              <RecordSales />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notification />
            </PrivateRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <PrivateRoute>
              <Feedback />
            </PrivateRoute>
          }
        />

        {/* Worker routes */}
        <Route
          path="/worker/*"
          element={
            <PrivateRoute>
              <WorkerDashboard />
            </PrivateRoute>
          }
        >
          {/* Default worker page */}
          <Route index element={<WorkerRecordSales />} />

          {/* Worker pages */}
          <Route path="record-sales" element={<WorkerRecordSales />} />
          <Route path="available-products" element={<AvailableProducts />} />
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <h1 className="text-center text-white mt-20">
              404 – Page Not Found
            </h1>
          }
        />
      </Routes>
    </Router>
  );
}