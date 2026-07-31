


function App(){
    const initals =[
        {id:1,title:"Salary",amount:5000,category:"Income",type:"Credit",date:"2023-01-01"},
    ]
    const[transactions,setTransactions] = useState(initals);

 //inpput change dynamically
 
 
 const handle= (e)=>{
    const product = transactions.map((item)=>{
        if(item.id === e.target.id){
            return{...transaction,[field]:e.target.value}
        }
        return item;
    })
 }
         
   
}