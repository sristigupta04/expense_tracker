import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";
import Reports from "./pages/Reports";
import ProtectedRoute from "./components/ProtectedRoute";
import BudgetProgress from "./components/BudgetProgress";
import BudgetCard from "./components/BudgetCard";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import TransactionForm from "./components/TransactionForm";
import Transactiontable from "./components/TransactionList";
import IncomeCHart
function App() {

  const isLoggedIn = true;

  return (

    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/budget"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Budget />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Reports />
          </ProtectedRoute>
        }
      />

    </Routes>

  );
}

export default App;