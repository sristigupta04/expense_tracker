


function App(){
    const initals =[
        {id:1,title:"Salary",amount:5000,category:"Income",type:"Credit",date:"2023-01-01"},
    ]
    const[transactions,setTransactions] = useState(initals);

 //inpput change dynamically
 
 
 const handle= (e)=>{
    const product = transactions.map((item)=>{
        if(item.id === e.target.id){
            return{...item,[e.target.name]:e.target.value}
        }
        return item;
    })
    setTransactions(product);
 }
   
 

 //addd new ttransactions



 const addtransaction = (e)=>{
    const newtransaction ={
        id:Date.now(),
        name:e.target.name.value,
        amount:e.target.amount.value,
        category:e.target.category.value,
        type:e.target.type.value,
        date:e.target.date.value
    }
    setTransactions([...transactions,newtransaction])
 }
   //remove trnasactions

   const remove =(id)=>{
    const  removeItem = transactions.filter((id))=>{item.id !== id)};
    setTransactions(removeItem);
   }
}