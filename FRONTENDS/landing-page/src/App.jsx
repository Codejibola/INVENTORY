import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";

import Terms from "./pages/Terms.jsx";
import DemoPage from "./pages/Demo.jsx";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/demo" element={<DemoPage />} />
    </Routes>
  );
}
