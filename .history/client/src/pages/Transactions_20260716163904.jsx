
import React, { useState, useEffect } from 'react';


export default function Transactions() {
const [transactions, setTransactions] = useState([
    {
      id: 1,
      title: "Salary",
      category: "Salary",
      amount: 30000,
      type: "income",
      date: "2026-07-01"
    },
    {
      id: 2,
      title: "Food",
      category: "Food",
      amount: 500,
      type: "expense",
      date: "2026-07-03"
    }]);


    function handleSubmit(){

    }

    function addTransaction(field) {
        <form onSubmit= {handlesubmit}>
     <input type='text' placeholder="enter your title name"/>
      <input type='text' placeholder="enter your category name"/>
       <input type='number' placeholder="enter your amount"/>
        <input type='text' placeholder="enter your type"/>
         <input type='date' placeholder="enter your date"/>

</form>   
 let newtransaction = {
    newtransaction ={
    transactions.forEach(field => {
            
        })
    }
setTransactions([...transactions, newtransaction]);
}



function deleteTransaction(id) {
    const transaction = transactions.find(transaction => transaction.id === id);
    setTransactions(transactions.filter(transaction => transaction.id !== id));

}

function editTransaction(id, updatedTransaction) {
    const transaction = transactions.find(transaction => transaction.id === id);
 setTransactions(transaction.map(transaction => transaction.id === id? updatedTransaction : transaction));

}
function display(){
    transactions.map((t)=>{
        <li key={t.id}>m<strong>{t.title}</strong></li>
        <li key={t.id}>m<strong>{t.amount}</strong></li>
    })
}
return (
    <div>
        <h1> Transactions</h1>
     <h2> {addTransaction("title")}</h2>  
      <h2> {addTransaction("Amount")}</h2>  
      <h2> {addTransaction("category")}</h2>  
        <h2> {addTransaction("type")}</h2>  
      <h2> {addTransaction("date")}</h2>  
<div>
    <h1>Transaction list</h1>

</div>
    </div>
 )
}