
import api from "./api";

export const getSharedGroups = async () => {
  const { data } = await api.get("/shared-expenses/groups");
  return data.groups || [];
};

export const createSharedGroup = async (payload) => {
  const { data } = await api.post("/shared-expenses/groups", payload);
  return data.group;
};

export const getGroupExpenses = async (groupId) => {
  const { data } = await api.get(
    `/shared-expenses/groups/${groupId}/expenses`
  );
  return data.expenses || [];
};

export const getGroupBalances = async (groupId) => {
  const { data } = await api.get(
    `/shared-expenses/groups/${groupId}/balances`
  );
  return data.balances || [];
};

export const createSharedExpense = async (payload) => {
  const { data } = await api.post("/shared-expenses/expenses", payload);
  return data.expense;
};

export const createSettlement = async (payload) => {
  const { data } = await api.post("/shared-expenses/settlements", payload);
  return data.settlement;
};
