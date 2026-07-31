import { useEffect, useState } from "react";
import {
  getDashboardReport,
  getCategoryReport,
  getMonthlyReport,
} from "../services/report";

import formatCurrency from "../utils/formatCurrency";

export default function Reports() {
  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
  });

  const [categoryReport, setCategoryReport] = useState({});
  const [monthlyReport, setMonthlyReport] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    try {
      const summaryData = await getDashboardReport();
      const categoryData = await getCategoryReport();
      const monthlyData = await getMonthlyReport();

      setSummary(summaryData);
      setCategoryReport(categoryData);
      setMonthlyReport(monthlyData);
    } catch (err) {
      console.error("Error loading reports:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h2>Loading Reports...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-8">
          Reports
        </h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-100 rounded-xl p-5">
            <h3 className="text-lg font-semibold">
              Total Income
            </h3>
            <p className="text-2xl font-bold text-green-700">
              {formatCurrency(summary.income)}
            </p>
          </div>

          <div className="bg-red-100 rounded-xl p-5">
            <h3 className="text-lg font-semibold">
              Total Expense
            </h3>
            <p className="text-2xl font-bold text-red-700">
              {formatCurrency(summary.expense)}
            </p>
          </div>

          <div className="bg-blue-100 rounded-xl p-5">
            <h3 className="text-lg font-semibold">
              Current Balance
            </h3>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(summary.balance)}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Category Report
          </h2>

          {Object.entries(categoryReport).map(([category, amount]) => (
            <div
              key={category}
              className="flex justify-between border-b py-2"
            >
              <span>{category}</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Monthly Report
          </h2>

          {Object.entries(monthlyReport).map(([month, amount]) => (
            <div
              key={month}
              className="flex justify-between border-b py-2"
            >
              <span>{month}</span>
              <span>{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}