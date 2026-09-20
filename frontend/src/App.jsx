import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/auth/Login";
import Landing from "./pages/Landing";
import RegisterChoice from "./pages/auth/RegisterChoice";
import RegisterDonor from "./pages/auth/RegisterDonor";
import RegisterHospital from "./pages/auth/RegisterHospital";
import DonorDashboard from "./pages/donor/DonorDashboard";
import DonorAlerts from "./pages/donor/DonorAlerts";
import DonorProfile from "./pages/donor/DonorProfile";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalRequests from "./pages/hospital/HospitalRequests";
import HospitalProfile from "./pages/hospital/HospitalProfile";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useAuthStore } from "./store/authStore";

function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterChoice />} />
        <Route path="/register/donor" element={<RegisterDonor />} />
        <Route path="/register/hospital" element={<RegisterHospital />} />

        <Route path="/donor" element={<ProtectedRoute allowedRole="donor"><DonorDashboard /></ProtectedRoute>} />
        <Route path="/donor/alerts" element={<ProtectedRoute allowedRole="donor"><DonorAlerts /></ProtectedRoute>} />
        <Route path="/donor/profile" element={<ProtectedRoute allowedRole="donor"><DonorProfile /></ProtectedRoute>} />

        <Route path="/hospital" element={<ProtectedRoute allowedRole="hospital"><HospitalDashboard /></ProtectedRoute>} />
        <Route path="/hospital/requests" element={<ProtectedRoute allowedRole="hospital"><HospitalRequests /></ProtectedRoute>} />
        <Route path="/hospital/profile" element={<ProtectedRoute allowedRole="hospital"><HospitalProfile /></ProtectedRoute>} />

        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App