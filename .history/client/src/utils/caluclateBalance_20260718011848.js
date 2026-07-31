export function getTransactions() {
  return JSON.parse(localStorage.getItem("transactions")) || [];
}

export function addTransaction(transaction) {
  const transactions = getTransactions();

  const newTransaction = {
    id: Date.now(),
    ...transaction,
  };

  transactions.push(newTransaction);

  localStorage.setItem(
    "transactions",
    JSON.stringify(transactions)
  );

  return newTransaction;
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
  return getTransactions().find(
    (transaction) => transaction.id === id
  );
}

export function clearTransactions() {
  localStorage.removeItem("transactions");
}