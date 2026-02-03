import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Registration";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Manage_Products from "./pages/Manage_Products";
import Invoices from "./pages/Invoices";
import RecordSales from "./pages/Record_Sales";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Notification from "./pages/Notification";
import SelectMode from "./pages/SelectMode";
import WorkerDashboard from "./pages/WorkerDashboard";
import AvailableProducts from "./pages/AvailableProducts";

import PrivateRoute from "./components/PrivateRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Root redirects to login (Admin) */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Protected routes */}
        <Route
          path="/select-mode"
          element={
            <PrivateRoute>
              <SelectMode />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
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

        {/* Worker Routes */}
        <Route
          path="/worker/*"
          element={
            <PrivateRoute>
              <WorkerDashboard />
            </PrivateRoute>
          }
        >
          {/* Nested worker pages */}
          <Route index element={<RecordSales />} /> {/* default */}
          <Route path="record-sales" element={<RecordSales />} />
          <Route path="available-products" element={<AvailableProducts />} />
        </Route>

        {/* 404 fallback */}
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
