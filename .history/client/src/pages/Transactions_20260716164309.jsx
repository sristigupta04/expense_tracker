
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


   function handleSubmit(e) {
    e.preventDefault();

    const title = e.target.title.value;
    const amount = Number(e.target.amount.value);
    const type = e.target.type.value;

    const transaction = {
      id: transactions.length + 1,
      title,
      amount,
      type
    };

    addTransaction(transaction);

    e.target.reset();
  }

    function addTransaction(transaction) {

    setTransactions([...transactions, transaction]);

    if (transaction.type === "income") {
      setIncome(income + transaction.amount);
      setBalance(balance + transaction.amount);
    }

    if (transaction.type === "expense") {
      setExpense(expense + transaction.amount);
      setBalance(balance - transaction.amount);
    }
  }




function deleteTransaction(id) {
    setTransactions(transactions.filter(transaction => 
        transaction.id !== id));

}

function editTransaction(id, updatedTransaction) {
    const transaction = transactions.find(transaction => transaction.id === id);
 setTransactions(transaction.map(transaction => transaction.id === id? updatedTransaction : transaction));

}
function display(){
    return transactions.map((t)=>{
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
    {transactions.map((transaction) => (

  <div key={transaction.id}>

    <h3>{transaction.title}</h3>

    <p>{transaction.amount}</p>

    <button onClick={() => deleteTransaction(transaction.id)}>
      Delete
    </button>

  </div>

))}
   <button onClick={() => deleteTransaction(transaction.id)}>
  Delete
</button>
</div>
    </div>
 )
    }}