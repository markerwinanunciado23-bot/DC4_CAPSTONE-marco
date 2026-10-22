import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Buses from "./pages/Buses";
import RoutesPage from "./pages/Routes";
import Schedules from "./pages/Schedules";
import Bookings from "./pages/Bookings";

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Preparing Blue Way...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />

      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login />}
      />

      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/buses" element={<Buses />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/bookings" element={<Bookings />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}