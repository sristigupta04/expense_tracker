// services/transactionService.js

export function getTransactions() {
  try {
    return JSON.parse(localStorage.getItem("transactions")) || [];
  } catch {
    return [];
  }
}

export function addTransaction(transaction) {
  if (
    !transaction.title ||
    !transaction.amount ||
    !transaction.category ||
    !transaction.type ||
    !transaction.date
  ) {
    throw new Error("Invalid transaction.");
  }

  const transactions = getTransactions();

  transactions.push({
    id: Date.now(),
    ...transaction,
  });

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

  return transactions;
}

export function deleteTransaction(id) {
  const transactions = getTransactions().filter(
    (transaction) => transaction.id !== Number(id)
  );

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

  return transactions;
}

export function editTransaction(id, updatedTransaction) {
  const transactions = getTransactions().map((transaction) =>
    transaction.id === Number(id)
      ? { ...transaction, ...updatedTransaction }
      : transaction
  );

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

  return transactions;
}

export function getTransactionById(id) {
  return getTransactions().find(
    (transaction) => transaction.id === Number(id)
  );
}

export function clearTransactions() {
  localStorage.removeItem("transactions");
}z