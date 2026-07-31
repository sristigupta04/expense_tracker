


function CategoryChart({ data }) 
    {
const char = transaction.reduce((acc,item)=>{
    const found = acc.find((i)=>data.category === i.category)
    if(found){
        found.amount += item.amount;
    }else{
        acc.push({...item});
    }
    return acc;
},[])
    }


    function App(){
        const [transactions,setTransactions] = useState([
           { title: "Pizza", amount: 500, category: "Food" },
  { title: "Burger", amount: 300, category: "Food" },
  { title: "Bus", amount: 200, category: "Travel" },
        ]);
        return(
            <PieChart width={300} height={300}>
  <Pie
    data={chartData}
    dataKey="amount"
    nameKey="category"
    outerRadius={100}
  />
</PieChart>
        )
    }