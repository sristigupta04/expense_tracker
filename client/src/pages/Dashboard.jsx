
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";
import FinancialSnapshot from "../components/FinancialSnapshot/FinancialSnapshot";
import WelcomeHeader from "../components/Dashboard/WelcomeHeader.jsx";
import SummaryCards from "../components/Dashboard/SummaryCards.jsx";
import RecentTransactions from "../components/Dashboard/RecentTransactions.jsx";
import QuickActions from "../components/Dashboard/QuickActions.jsx";
import SpendingOverview from "../components/Dashboard/SpendingOverview.jsx";

import CategoryChart from "../components/Charts/categorychart.jsx";
import DailyChart from "../components/Charts/dailychart.jsx";
import ExpenseChart from "../components/Charts/ExpenseChart.jsx";
import IncomeChart from "../components/Charts/Incomechart.jsx";
import MonthlyChart from "../components/Charts/MonthlyChart.jsx";

import useExpense from "../hooks/useExpense";
import TransactionForm from "../components/Transactions/TransactionForm.jsx";
import Loader from "../components/common/Loader.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    transactions = [],
    loading,
    error,
    addExpense,
    editExpense,
  } = useExpense();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [initialTransactionType, setInitialTransactionType] =
    useState("expense");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [exportMessage, setExportMessage] = useState("");

  // Calculate income, expenses and balance.
  const financialSummary = useMemo(() => {
    return transactions.reduce(
      (summary, transaction) => {
        const amount = Number(transaction.amount) || 0;
        const type = String(transaction.type || "").toLowerCase();

        if (type === "income") {
          summary.income += amount;
        } else if (type === "expense") {
          summary.expense += amount;
        }

        return summary;
      },
      { income: 0, expense: 0 }
    );
  }, [transactions]);

  const balance = financialSummary.income - financialSummary.expense;

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [transactions]);

  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "there";

  // Open the transaction form.
  const openTransactionForm = (type = "expense") => {
    setSelectedTransaction(null);
    setInitialTransactionType(type);
    setFormError("");
    setFormOpen(true);
  };

  // Open the form to edit a transaction.
  const openEditForm = (transaction) => {
    setSelectedTransaction(transaction);
    setInitialTransactionType(
      String(transaction.type || "expense").toLowerCase()
    );
    setFormError("");
    setFormOpen(true);
  };

  const closeTransactionForm = () => {
    if (saving) return;

    setFormOpen(false);
    setSelectedTransaction(null);
    setFormError("");
  };

  // Add or update a transaction.
  const handleSubmitTransaction = async (formData) => {
    setSaving(true);
    setFormError("");

    try {
      if (selectedTransaction) {
        const id = selectedTransaction._id || selectedTransaction.id;

        if (!id) {
          throw new Error("Transaction ID is missing.");
        }

        await editExpense(id, formData);
      } else {
        await addExpense(formData);
      }

      setFormOpen(false);
      setSelectedTransaction(null);
      setFormError("");
    } catch (err) {
      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save transaction. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Download transactions as a CSV file.
  const handleExport = () => {
    setExportMessage("");

    if (loading) {
      setExportMessage("Please wait. Transactions are loading.");
      return;
    }

    if (error) {
      setExportMessage(
        "Transactions could not be loaded. Please fix the login/session issue first."
      );
      return;
    }

    if (!transactions.length) {
      setExportMessage(
        "There are no transactions to export yet. Add a transaction first."
      );
      return;
    }

    const headers = [
      "Title",
      "Type",
      "Category",
      "Amount",
      "Date",
      "Note",
    ];

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = transactions.map((transaction) => [
      transaction.title,
      transaction.type,
      transaction.category,
      transaction.amount,
      transaction.date
        ? new Date(transaction.date).toLocaleDateString("en-IN")
        : transaction.createdAt
          ? new Date(transaction.createdAt).toLocaleDateString("en-IN")
          : "",
      transaction.note,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `expense-transactions-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Revoke after the browser has had time to start the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    setExportMessage("Your CSV export has been started.");
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {loading && <Loader />}

      <div className="mx-auto max-w-[1440px] space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <WelcomeHeader
          userName={userName}
          onAddTransaction={() => openTransactionForm("expense")}
          onExport={handleExport}
        />

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {typeof error === "string"
              ? error
              : error?.message || "Unable to load transactions."}

            <button
              type="button"
              onClick={() => navigate("/login")}
              className="ml-2 font-semibold underline"
            >
              Go to login
            </button>
          </div>
        )}

        {exportMessage && (
          <div
            role="status"
            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800"
          >
            {exportMessage}
          </div>
        )}
<FinancialSnapshot />
        <SummaryCards
          transactions={transactions}
          balance={balance}
          income={financialSummary.income}
          expense={financialSummary.expense}
          loading={loading}
        />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="min-w-0 xl:col-span-2">
            <RecentTransactions
              transactions={recentTransactions}
              loading={loading}
              limit={5}
              onViewAll={() => navigate("/transactions")}
              onEdit={openEditForm}
            />
          </div>

          <div className="min-w-0">
            <QuickActions
              onAddTransaction={(options) =>
                openTransactionForm(options?.type || "expense")
              }
              onAddIncome={() => openTransactionForm("income")}
              onAddExpense={() => openTransactionForm("expense")}
            />
          </div>
        </section>

        <SpendingOverview
          transactions={transactions}
          budgets={[]}
          loading={loading}
          onViewBudgets={() => navigate("/budgets")}
        />

        <section aria-label="Financial analytics">
          <div className="mb-5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Financial Analytics
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Understand your income, expenses and spending patterns.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-1 font-bold text-slate-900">
                Category Distribution
              </h3>
              <p className="mb-5 text-sm text-slate-500">
                See which categories account for your spending.
              </p>
              <CategoryChart transactions={transactions} />
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-1 font-bold text-slate-900">
                Daily Activity
              </h3>
              <p className="mb-5 text-sm text-slate-500">
                Compare your daily income and expenses.
              </p>
              <DailyChart transactions={transactions} />
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-1 font-bold text-slate-900">
                Expense Analysis
              </h3>
              <p className="mb-5 text-sm text-slate-500">
                Review your outgoing money over time.
              </p>
              <ExpenseChart transactions={transactions} />
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h3 className="mb-1 font-bold text-slate-900">
                Income Analysis
              </h3>
              <p className="mb-5 text-sm text-slate-500">
                Track your incoming money over time.
              </p>
              <IncomeChart transactions={transactions} />
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-2">
              <h3 className="mb-1 font-bold text-slate-900">
                Monthly Overview
              </h3>
              <p className="mb-5 text-sm text-slate-500">
                Compare income and expenses across months.
              </p>
              <MonthlyChart transactions={transactions} />
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-500">
          Manage your money with clarity and confidence.
        </footer>
      </div>

      <TransactionForm
        open={formOpen}
        transaction={
          selectedTransaction
            ? {
                ...selectedTransaction,
                type: initialTransactionType,
              }
            : { type: initialTransactionType }
        }
        onSubmit={handleSubmitTransaction}
        onClose={closeTransactionForm}
        loading={saving}
      />

      {formError && formOpen && (
        <div
          role="alert"
          className="fixed bottom-20 right-4 z-50 max-w-sm rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700 shadow-lg"
        >
          {formError}
        </div>
      )}
    </main>
  );
}
