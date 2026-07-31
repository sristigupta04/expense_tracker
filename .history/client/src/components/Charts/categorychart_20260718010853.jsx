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
