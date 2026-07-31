import api from "./api";

// Dashboard Summary
export const getDashboardReport = async () => {
  const { data } = await api.get("/report");
  return data;
};

// Category Report
export const getCategoryReport = async () => {
  const { data } = await api.get("/report/category");
  return data;
};

// Monthly Report
export const getMonthlyReport = async () => {
  const { data } = await api.get("/report/monthly");
  return data;
};