import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginDashboard from "./Login.jsx";
import EnhancedGEBDashboard from "./Dashboard.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginDashboard />} />
        <Route path="/dashboard" element={<EnhancedGEBDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;