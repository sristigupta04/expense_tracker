


function Dailychart({transactions}){
   const data = transactions.reduce((acc,item)=>{
    const found = acc.find((i)=>i.date === item.date);
    if(found){
        found.amount +=Number(item.amount);
    }else {
        acc.push({
            date:item.date,
            amount:Number(item.amount);
        })
    }
   })
}









function App(){
    const [transactions] = useState([
        { title: "Pizza", amount: 500, category: "Food" },
        { title: "Burger", amount: 300, category: "Food" },
        { title: "Bus", amount: 200, category: "Travel" },
        { title: "Shirt", amount: 1000, category: "Shopping" },
      ]);
      return(
       <>
       <Dailychart transactions ={transactions}/>
       
       </>
      )      

}