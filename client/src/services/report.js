
import api from "./api";

// Get dashboard summary report
export const getDashboardReport = async () => {
  const { data } = await api.get("/report");
  return data;
};

// Get category-wise report
export const getCategoryReport = async () => {
  const { data } = await api.get("/report/category");
  return data;
};

// Get monthly report
export const getMonthlyReport = async () => {
  const { data } = await api.get("/report/monthly");
  return data;
};
