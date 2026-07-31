
import income from "./income";


export default function summaryCard({balance,income,expense}){
    return(
        <div className="summary">
            <div className="value">
            
            </div>
            <div className ="balance">
                <p>{totalincome}</p>
                 <p>{totalbalance}</p>
                  <p>{totalexpense}</p>
            </div>
        </div>
    )
}