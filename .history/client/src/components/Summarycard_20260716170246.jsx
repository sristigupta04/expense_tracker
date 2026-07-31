
import income from "./income";


export default function summaryCard({balance,income,expense}){
    return(
        <div className="summary">
            <div className="value">
            
            </div>
            <div className ="balance">
                <p>{income}</p>
                 <p>{balance}</p>
                  <p>{expense}</p>
            </div>
        </div>
    )
}