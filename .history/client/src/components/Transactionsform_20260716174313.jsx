

function App(){
const [transactions, setTransactions] = React.useState([
    {
        title: "",
        amount: "",
        category: "",
        type: "",
        Date: ""
    }
]);
const [error, setError] = React.useState("");

const handle =(e)=>{
    const{title,amount,category,type,Date}=e.target;
    setTransactions((prevTransactions)=>({
        ...prevTransactions,
        [title]: amount,
        [category]: category,
        [type]: type,
        [Date]: Date
    }));
}


///evalute
const submit=(e)=>{
    e.preventDefault();
    let isvalid=true;
    if(!transactions.title || !transactions.amount || !transactions.category || !transactions.type || !transactions.Date){
        setError("Please fill in all fields");
        isvalid=false;
    }

    if(transactions.amount <=0){
        setError("Amount must be greater than 0");
        isvalid=false;
    }
     if(!isvalid){
        console.log(transactions);
     }
}
    return(
        <>
        <form onSubmit={submit}>
     <div>
        
        <label htmlFor="title">Title</label>
        <input type="text" id="title" name="title" value={transactions.title} onChange={handle} />
        <label htmlFor="amount">Amount</label>
        <input type="number" id="amount" name="amount" value={transactions.amount} onChange={handle} />
        <label htmlFor="category">Category</label>
        <input type="text" id="category" name="category" value={transactions.category} onChange={handle} />
        <label htmlFor="type">Type</label>
        <input type="text" id="type" name="type" value={transactions.type} onChange={handle} />
        <label htmlFor="Date">Date</label>
        <input type="date" id="Date" name="Date" value={transactions.Date} onChange={handle} />
     </div>
     {error && <p style={{color:"red"}}>{error}</p>}
     <button type="submit">Submit</button>
     </form>
        </>
    )
}
