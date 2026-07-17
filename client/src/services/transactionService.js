// services/transactionService.js

export function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

export function addTransaction(transaction) {
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
    (transaction) => transaction.id !== id
  );

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

  return transactions;
}

export function editTransaction(id, updatedTransaction) {
  const transactions = getTransactions().map((transaction) =>
    transaction.id === id
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
  const transactions = getTransactions();

  return transactions.find(
    (transaction) => transaction.id === id
  );
}

export function clearTransactions() {
  localStorage.removeItem("transactions");
}