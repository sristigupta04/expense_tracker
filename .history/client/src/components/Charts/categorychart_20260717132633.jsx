const { useState } = require("react");



function App(){
  const [transaction ,setTransactions] = useState([ ]);
 <category />
        
}
 function  ChartData({transaction}){
         const [form, setform] = useState([
        
  {
   title: "",
    amount: "",
    category: "",
    type: "",
    date: "",
  },
         ]);



         //handlesubmit

const handle =((e)=>{
e.preventDefault();
form.reduce((item)=>{
    item.id !== id
})
})
         //handle krna add new area


const addNew = transaction.filter((prev)=>{[
    ...prev,{
        id:Date.now(),
        ...form
    },
    ]});



    return(
        <>
        <div className="form" >

        </div>
        </>
    )




}