import React, { useState } from "react";
import { PieChart, Pie } from "recharts";

function CategoryChart({ transactions }) {
  const chartData = transactions.reduce((acc, item) => {
    const found = acc.find((i) => i.category === item.category);

    if (found) {
      found.amount += Number(item.amount);
    } else {
      acc.push({
        category: item.category,
        amount: Number(item.amount),
      });
    }

    return acc;
  }, []);

  return (
    <PieChart width={300} height={300}>
      <Pie
        data={chartData}
        dataKey="amount"
        nameKey="category"
        outerRadius={100}
      />
    </PieChart>
  );
}

function App() {
  const [transactions] = useState([
    { title: "Pizza", amount: 500, category: "Food" },
    { title: "Burger", amount: 300, category: "Food" },
    { title: "Bus", amount: 200, category: "Travel" },
    { title: "Shirt", amount: 1000, category: "Shopping" },
  ]);

  return (
    <>
      <CategoryChart transactions={transactions} />
    </>
  );
}

export default App;