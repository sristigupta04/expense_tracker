


function Dailychart({data}){

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
       <Dailychart data ={transactions}/>
       
       </>
      )      

}