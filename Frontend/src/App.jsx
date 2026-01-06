// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Auth from "./Pages/Auth";
import Dashboard from "./Pages/Dashboard";
import Expenses from "./Pages/Expenses";
import Incomes from "./Pages/Incomes";
import ForgotPassword from "./Pages/ForgotPassword";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Auth />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <PrivateRoute>
            <Expenses />
          </PrivateRoute>
        }
      />
      <Route
        path="/incomes"
        element={
          <PrivateRoute>
            <Incomes />
          </PrivateRoute>
        }
      />

      {/* Any unknown path → redirect to / */}
      <Route path="*" element={<Navigate to="/" />} />
      <Route path="/forgot" element={<ForgotPassword />} />
    </Routes>
  );
}
