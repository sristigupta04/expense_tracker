import { useContext } from "react";
import {CalculateBalance} from "../utils/caluclateBalance";
import { ExpenseContext } from "../context/expenseContext";

export default function useExpense() {
    const { income, expense, balance } = calculateBalance(transactions);
    return useContext(ExpenseContext);
}