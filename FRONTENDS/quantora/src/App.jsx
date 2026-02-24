import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Registration";
import Admin from "./pages/Admin";
import SelectMode from "./pages/SelectMode";
import ForgotPassword from "./pages/Forgot-Password";
import ResetPassword from "./pages/ResetPassword";
import { AuthProvider } from "./context/AuthContext";

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
import Subscription from "./pages/Subscribtion";

// Worker pages
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerRecordSales from "./pages/WorkerRecordSales";
import AvailableProducts from "./pages/AvailableProducts";

import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Admin />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Mode selection */}
          <Route path="/select-mode" element={<PrivateRoute><SelectMode /></PrivateRoute>} />

          {/* Admin routes */}
          <Route path="/dashboard" element={<PrivateRoute allowedRole="admin"><Dashboard /></PrivateRoute>} />
          <Route path="/manage_products" element={<PrivateRoute allowedRole="admin"><Manage_Products /></PrivateRoute>} />
          <Route path="/recordSales" element={<PrivateRoute allowedRole="admin"><RecordSales /></PrivateRoute>} />
          <Route path="/invoices" element={<PrivateRoute allowedRole="admin"><Invoices /></PrivateRoute>} />
          <Route path="/notifications" element={<PrivateRoute allowedRole="admin"><Notification /></PrivateRoute>} />
          <Route path="/feedback" element={<PrivateRoute allowedRole="admin"><Feedback /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute allowedRole="admin"><Settings /></PrivateRoute>} />
          <Route path="/subscription" element={<PrivateRoute allowedRole="admin"><Subscription /></PrivateRoute>} />

          {/* Worker routes */}
          <Route path="/worker/*" element={<PrivateRoute allowedRole="worker"><WorkerDashboard /></PrivateRoute>}>
             <Route index element={<WorkerRecordSales />} />
             <Route path="record-sales" element={<WorkerRecordSales />} />
             <Route path="available-products" element={<AvailableProducts />} />
          </Route>

          <Route path="*" element={<h1 className="text-center text-white mt-20">404 – Page Not Found</h1>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}