import { Bar, BarChart } from "recharts";



function Dailychart({transactions}){
   const data = transactions.reduce((acc,item)=>{
    const found = acc.find((i)=>i.date === item.date);
    if(found){
        found.amount +=Number(item.amount);
    }else {
        acc.push({
            date:item.date,
            amount:Number(item.amount);
        });
    }
        return acc;
   },[]);



   return (
    <BarChart width={500}
height={300} data ={transactions}>
        <Bar
        Datekey ="date"
        dataKey="amount"
        fill="#8884d8"
        />
    </BarChart>

   )
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