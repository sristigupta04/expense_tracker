import api from "./api";

// Get dashboard summary report
export const getDashboardReport = async (params = {}) => {
  const { data } = await api.get("/report", { params });
  return data;
};

// Get category-wise report
export const getCategoryReport = async (params = {}) => {
  const { data } = await api.get("/report/category", { params });
  return data;
};

// Get monthly report
export const getMonthlyReport = async (params = {}) => {
  const { data } = await api.get("/report/monthly", { params });
  return data;
};