


export default function Reports(){
   
    const [transactions, setTransactions] = useState([{
  id: 1,
    title: "Salary",
    category: "Salary",
    amount: 30000,
    type: "income",
    date: "2026-07-01"
 } ]);

    function calculateExpense(){
        const total = transactions.filter((t)=>t.type === "expense")
        .reduce((acc,t)=>{
            return acc + t.amount;
        }, 0);        
    }
    function calculateIncome(){
        const incomeTotal = transactions.filter((t)=>t.type === "income")
        .reduce((acc, t)=>{
            return acc + t.amount;
        }, 0);
        setIncome(incomeTotal);
        setReports(`${incomeTotal}`);
        setBalance(incomeTotal - expense);
    }
}

function calculateBalance(){
    const balanceTotal = income - expense;
    setBalance(balanceTotal);
    setReports(`${balanceTotal}`);
}

function categoryWiseReport(){
    const category = transactions.filter((t) =>t.category === "food" || t.category === "salary" || t.category === "entertainment" || t.category === "transportation" || t.category === "utilities" || t.category === "healthcare" || t.category === "education" || t.category === "shopping" || t.category === "travel" || t.category === "other");
        const total = category.reduce((acc,t)=>{
            return acc +t.amount;
        });
        setReports(`${total}`);
        

    }
    


    function monthyReport(){
      
    }









// calculateIncome()

// calculateExpense()

// calculateBalance()

// categoryWiseReport()

// monthlyReport()