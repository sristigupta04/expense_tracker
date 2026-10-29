
import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/Authcontext";

import AppLayout from "./components/layout/AppLayout";
import Loader from "./components/common/Loader";

// Authentication
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Main pages
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SavingGoals from "./pages/SavingGoals";
import RecurringExpenses from "./pages/RecurringExpenses";
import SharedExpenses from "./pages/SharedExpenses";
import Notifications from "./pages/Notifications";

// Banking pages — actual folder: src/pages/banking/
import BankAccounts from "./pages/BankAccounts";
import BankingDashboard from "./pages/banking/BankingDashboard";
import AddBankAccount from "./pages/banking/AddBankAccount";
import EditBankAccount from "./pages/banking/EditBankAccount";
import BankAccountDetails from "./pages/banking/BankAccountDetails";
import BankTransactions from "./pages/banking/BankTransactions";
import CreditCards from "./pages/banking/CreditCards";
import AddCreditCard from "./pages/banking/AddCreditCard";
import EditCreditCard from "./pages/banking/EditCreditCard";
import CreditCardDetails from "./pages/banking/CreditCardDetails";
import BankStatements from "./pages/banking/BankStatements";
import ImportStatement from "./pages/banking/ImportStatement";
import MoneyTransfers from "./pages/banking/MoneyTransfers";
import TransferDetails from "./pages/banking/TransferDetails";
import Reconciliation from "./pages/banking/Reconciliation";
import ReconciliationDetails from "./pages/banking/ReconciliationDetails";

// Settings pages
import ProfileSettings from "./pages/settings/ProfileSettings";
import AppearanceSettings from "./pages/settings/AppearanceSettings";
import NotificationSettings from "./pages/settings/NotificationSettings";
import PreferencesSettings from "./pages/settings/PreferencesSettings";
import PrivacySecuritySettings from "./pages/settings/PrivacySecuritySettings";
import ContactSupport from "./pages/settings/ContactSupport";
import HelpSupport from "./pages/settings/HelpSupportSettings";

// Account management
import AccountManagement from "./pages/settings/account/AccountManagement";
import DeactivateAccount from "./pages/settings/account/DeactivateAccount";
import DeleteAccount from "./pages/settings/account/DeleteAccount";

// 404
import NotFound from "./pages/NotFound";

// Protected route
function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader text="Loading your account..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Guest route
function GuestRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader text="Please wait..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// Protected layout
function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppLayout />
    </ProtectedRoute>
  );
}

// Main application
export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* Protected routes */}
      <Route element={<ProtectedLayout />}>
        <Route
          index
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Main pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/saving-goals" element={<SavingGoals />} />
        <Route path="/recurring" element={<RecurringExpenses />} />
        <Route path="/shared-expenses" element={<SharedExpenses />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Banking overview */}
        <Route path="/bank-accounts" element={<BankAccounts />} />
        <Route path="/banking" element={<BankingDashboard />} />

        {/* Bank accounts */}
        <Route
          path="/banking/accounts/add"
          element={<AddBankAccount />}
        />
        <Route
          path="/banking/accounts/:accountId"
          element={<BankAccountDetails />}
        />
        <Route
          path="/banking/accounts/:accountId/edit"
          element={<EditBankAccount />}
        />

        {/* Banking transactions */}
        <Route
          path="/bank-transactions"
          element={<BankTransactions />}
        />

        {/* Credit cards */}
        <Route path="/credit-cards" element={<CreditCards />} />
        <Route
          path="/banking/credit-cards/add"
          element={<AddCreditCard />}
        />
        <Route
          path="/banking/credit-cards/:cardId"
          element={<CreditCardDetails />}
        />
        <Route
          path="/banking/credit-cards/:cardId/edit"
          element={<EditCreditCard />}
        />

        {/* Statements */}
        <Route path="/bank-statements" element={<BankStatements />} />
        <Route
          path="/banking/statements/import"
          element={<ImportStatement />}
        />

        {/* Transfers */}
        <Route path="/transfers" element={<MoneyTransfers />} />
        <Route
          path="/banking/transfers/:transferId"
          element={<TransferDetails />}
        />

        {/* Reconciliation */}
        <Route
          path="/reconciliation"
          element={<Reconciliation />}
        />
        <Route
          path="/banking/reconciliation/:reconciliationId"
          element={<ReconciliationDetails />}
        />

        {/* Settings */}
        <Route path="/settings" element={<Settings />} />
        <Route
          path="/settings/profile"
          element={<ProfileSettings />}
        />
        <Route
          path="/settings/appearance"
          element={<AppearanceSettings />}
        />
        <Route
          path="/settings/preferences"
          element={<PreferencesSettings />}
        />
        <Route
          path="/settings/notifications"
          element={<NotificationSettings />}
        />
        <Route
          path="/settings/privacy"
          element={<PrivacySecuritySettings />}
        />
        <Route
          path="/settings/help"
          element={<HelpSupport />}
        />
        <Route
          path="/settings/contact"
          element={<ContactSupport />}
        />

        {/* Account management */}
        <Route
          path="/settings/account"
          element={<AccountManagement />}
        />
        <Route
          path="/settings/account/deactivate"
          element={<DeactivateAccount />}
        />
        <Route
          path="/settings/account/delete"
          element={<DeleteAccount />}
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}