
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
        transaction.id !== id));}

function editTransaction(id) {
    const transaction = transactions.find(transaction => transaction.id === id);
    const newTitle = prompt("Enter New Title");
  const newCategory = prompt("Enter New Category");
  const newAmount = Number(prompt("Enter New Amount"));
  const newType = prompt("Enter Type (income/expense)");
  const newDate = prompt("Enter New Date");

 setTransactions(transaction.map(transaction => transaction.id === id? {
    ...transaction,
    title: newTitle,
    category: newCategory,
    amount: newAmount,
    type: newType,
    date: newDate
  } : transaction));

}
function display(){
    return transactions.map((transaction)=>{
        <div key={transaction.id}>
             <h3>{transaction.title}</h3>

      <p>Category : {transaction.category}</p>

      <p>Amount : ₹{transaction.amount}</p>

      <p>Type : {transaction.type}</p>

      <p>Date : {transaction.date}</p>
      <button onClick={() => deleteTransaction(transaction.id)}> delte</button>
      <button onClick={() => editTransaction(transaction.id)}> edit</button>
        </div>
    })
}
return (
<>
    <div>
        <h1> Transactions</h1>
     <h2> {addTransaction("title")}</h2>  
      <h2> {addTransaction("Amount")}</h2>  
      <h2> {addTransaction("category")}</h2>  
        <h2> {addTransaction("type")}</h2> 

      <h2> {addTransaction("date")}</h2>  
      </div>
<div>
    {/* //delete */}
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
    </>
 )
    }}