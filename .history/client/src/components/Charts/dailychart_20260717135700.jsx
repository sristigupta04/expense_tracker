import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";


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
height={300} data ={data}>
        <Bar
       dataKey="amount"
        Xaxis={{ dataKey: "date" }},
        Yaxis={{ dataKey: "amount" }}
        tootltip={{ formatter: (value) => `$${value}` }}
        
        />
    </BarChart>

   )
}





function App(){
    const [transactions] = useState([
        { title: "Pizza", amount: 500, category: "Food", date: "2023-06-01" },
        { title: "Burger", amount: 300, category: "Food", date: "2023-06-01" },
        { title: "Bus", amount: 200, category: "Travel", date: "2023-06-01" },
        { title: "Shirt", amount: 1000, category: "Shopping", date: "2023-06-01" },
      ]);
      return(
       <>
       <Dailychart transactions ={transactions}/>
       
       </>
      )      

}