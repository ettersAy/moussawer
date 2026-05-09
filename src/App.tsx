import { Route, Routes } from "react-router-dom";
import { AdminRoute } from "./components/AdminRoute";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RequireRole } from "./components/RequireRole";
import { AdminPage } from "./pages/AdminPage";
import { CasesPage } from "./pages/CasesPage";
import { DashboardPage } from "./pages/DashboardPage";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { MessagesPage } from "./pages/MessagesPage";
import { PhotographerProfilePage } from "./pages/PhotographerProfilePage";
import { PhotographerDashboard } from "./pages/photographer/PhotographerDashboard";
import { RegisterPage } from "./pages/RegisterPage";
import { SupportPage } from "./pages/SupportPage";
import MushajjirApp from "./components/MushajjirApp";

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/photographers" element={<DiscoveryPage />} />
        <Route path="/photographers/:identifier" element={<PhotographerProfilePage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/cases" element={<CasesPage />} />
        </Route>
        <Route element={<RequireRole allowedRoles={["PHOTOGRAPHER"]} />}>
          <Route path="/photographer" element={<PhotographerDashboard />} />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/mindmap" element={<MushajjirApp />} />
      </Route>
    </Routes>
  );
}
