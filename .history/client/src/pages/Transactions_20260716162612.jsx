
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
 return (
    <div>
        <h1> Transactions</h1>
     <h2> {addTransaction("title")}</h2>   
    </div>
 )
}