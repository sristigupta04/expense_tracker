


export default function Reports(){
    const [reports, setReports] = useState("");
    const [balance, setBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [transactions, setTransactions] = useState([{
  id: 1,
    title: "Salary",
    category: "Salary",
    amount: 30000,
    type: "income",
    date: "2026-07-01"
 } ]);
    const [budgets, setBudgets] = useState([]);


    function calculateIncome(){
        const incomeTotal = transactions.filter((t)=>t.type === "income")
        .reduce((acc, t)=>{
            return acc + t.amount;
        }, 0);
        setIncome(incomeTotal);
        setReports(`${{incomeTotal}}`);
        setBalance(incomeTotal - expenseTotal);
    }
}











// calculateIncome()

// calculateExpense()

// calculateBalance()

// categoryWiseReport()

// monthlyReport()