

export default function Dashboard() {
  const [balance, setBalance] = useState(25000);
const [income, setIncome] = useState(40000);
const [expense, setExpense] = useState(15000);

const [transactions, setTransactions] = useState([
  {
    id: 1,
    title: "Salary",
    amount: 30000,
    type: "income"
  },
  {
    id: 2,
    title: "Food",
    amount: 500,
    type: "expense"
  }
]);
}