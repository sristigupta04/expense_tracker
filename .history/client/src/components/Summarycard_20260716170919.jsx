
import income from "./income";


function App(){
    return(
    <card(title="Income" amount={income} />
    <card(title="expense" amount={expense} />
    <card(title="balance" amount={balance} />

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