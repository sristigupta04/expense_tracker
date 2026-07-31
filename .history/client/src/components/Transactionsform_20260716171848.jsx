

function App(){

    return(
        <>
        <Card title="Add Transaction" amount="" category="" type="" Date="" />
        
        </>
    )
}


function Card({title,amount,category,type,Date}){
    return(
        <form method='POST' action="http://localhost:5000/transactions">
            <input type="text" name="title" placeholder="Title" />
            <input type="number" name="amount" placeholder="Amount" />
            <input type="text" name="category" placeholder="Category" />
            <input type="text" name="type" placeholder="Type" />
            <input type="date" name="Date" placeholder="Date" />
            <button type="submit">Add Transaction</button>

        </form>
    )
}