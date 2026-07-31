const { useState } = require("react");



function App(){
  const [transaction ,setTransactions] = useState([ ]);
 <category />
        
}
 function  ChartData({transaction}){
         const [form, setform] = useState([
        
  {
    id: 1,
    title: "Pizza",
    amount: 500,
    category: "Food",
    type: "Expense",
    date: "2026-07-17",
  },
         ]);

         //handle krna add new area


const addNew = transaction.filter((prev)=>{[
    ...prev,{
        id:Date.now(),
        ...form
    },
    }])




}