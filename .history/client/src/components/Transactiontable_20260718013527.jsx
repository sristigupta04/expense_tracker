import formatDate from "../utils/formatDate";
import formatCurrency from "../utils/formatCurrency";
export default function TransactionTable({
  transactions,
  remove,
}) {
  return (
    <div>
      <h2>Transactions</h2>

      {transactions.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>

<p>Amount : {formatCurrency(item.amount)}</p>
          <p>Category : {item.category}</p>

          <p>Type : {item.type}</p>

          <p>Date : {formatDate(item.date)}</p>

          <button
            onClick={() => remove(item.id)}
          >
            Delete
          </button>

          <hr />
        </div>
      ))}
    </div>
  );
}