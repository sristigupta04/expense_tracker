
import { useExpense as useExpenseContext } from "../context/expenseContext";

export default function useExpense() {
  return useExpenseContext();
}
