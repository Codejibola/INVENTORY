import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Registration";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Manage_Products from "./pages/Manage_Products";
import Invoices from "./pages/Invoices";
import RecordSales from "./pages/Record_Sales";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import PrivateRoute from "./components/PrivateRoute"; 
import Notification from "./pages/Notification";
// import NotesPage from "./pages/Notes.jsx"; 
// import Maintenance from "./pages/Maintenance";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Root redirects to /admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Protected routes */}
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

        {/* ✅ NOTES PAGE (new) */}
        {/* <Route
          path="/notes"
          element={
            <PrivateRoute>
              <NotesPage />
            </PrivateRoute>
          }
        /> */}

        {/* 404 fallback */}
        <Route
          path="*"
          element={<h1 className="text-center text-white mt-20">404 – Page Not Found</h1>}
        />
      </Routes>
    </Router>
  );
}
