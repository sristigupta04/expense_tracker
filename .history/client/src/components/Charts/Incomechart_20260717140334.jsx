


function IncomeChart({transactions}){
    const chart = transactions.filter((item)=>item.amount>0);
    const Data = transactions.reduce((acc,item)=>{

        const found = acc.find((i)=>i.)
    })
}







function App(){
    const [transactions] =useState([
        
           {title:"Salary", amount:30000},
 {title:"Freelancing", amount:5000},
 {title:"Bonus", amount:2000}  
        
    ]);

    return(
        <>
        
     <IncomeChart transactions={transactions}/>   
        </>
    );
}

export default IncomeChart;

