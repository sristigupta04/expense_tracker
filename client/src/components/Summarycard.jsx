
import income from "./income";
import expense from "./expense";
import balance from "./balance";

function App(){
    return(
        <>
    <Card title="Income" amount={income} type="income" />
    <Card title="expense" amount={expense} type="expense" />
    <Card title="balance" amount={balance} type="balance" />
</>
    )  
}
function Card({title,amount,type}){
    return(
        <div className="card">
            <h2>{title}</h2>
            <p>{amount}</p>
            <p>{type}</p> 
        </div>
    )
}