

function App(){
const [transactions, setTransactions] = React.useState([
 title: "Salary",
 amount:100,
 category: "Income",
]);
setTransactions(transactions);
    return(
        <>
        <Card title="Add Transaction" amount="" category="" type="" Date="" />

        </>
    )
}
