
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";

import ProtectedRoute from "./components/ProtectedRoute";

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold tracking-tight text-blue-700">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-semibold text-slate-900">
          Page Not Found
        </h2>

        <p className="mt-2 text-slate-600">
          The page you are looking for does not exist.
        </p>

        <button
          type="button"
          onClick={() => (window.location.href = "/login")}
          className="mt-6 rounded-xl bg-blue-700 px-5 py-3 font-medium text-white transition hover:bg-blue-800"
        >
          Back to Login
        </button>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/budget"
        element={
          <ProtectedRoute>
            <Budgets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
