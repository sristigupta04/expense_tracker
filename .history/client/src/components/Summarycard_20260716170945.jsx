
import income from "./income";


function App(){
    return(
    <card(title="Income" amount={income} type="income" />
    <card(title="expense" amount={expense} type="expense" />
    <card(title="balance" amount={balance} type="balance" />

    )
    
}
function card({title,amount}){
    return(
        <div className="card">
            <h2>{title}</h2>
            <p>{amount}</p>
        </div>
    )
}