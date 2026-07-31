
import income from "./income";


export default function SummaryCard({balance,income,expense}){
    return(
        <div className="summary">
            <div className="value">
             {title.value}
             {amount.value}
             {icon.value}
             {color.value}
            </div>
            <div className ="balance">
                <p>{income}</p>
                 <p>{balance}</p>
                  <p>{expense}</p>
            </div>
        </div>
    )
}