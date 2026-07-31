return (
  <div className="min-h-screen bg-slate-100 p-6">

    <div className="mx-auto max-w-7xl">

      <h1 className="mb-8 text-4xl font-bold text-slate-800">
        Reports
      </h1>

      {/* Summary */}

      <div className="grid gap-6 md:grid-cols-3">

        <div className="rounded-2xl bg-green-500 p-6 text-white shadow-lg">
          <h2 className="text-lg font-medium">Income</h2>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(income)}
          </p>
        </div>

        <div className="rounded-2xl bg-red-500 p-6 text-white shadow-lg">
          <h2 className="text-lg font-medium">Expense</h2>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(expense)}
          </p>
        </div>

        <div className="rounded-2xl bg-blue-600 p-6 text-white shadow-lg">
          <h2 className="text-lg font-medium">Balance</h2>

          <p className="mt-2 text-3xl font-bold">
            {formatCurrency(balance)}
          </p>
        </div>

      </div>

      {/* Reports */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">

        {/* Category */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-bold">
            Category Report
          </h2>

          {Object.entries(categoryReport).map(([category, amount]) => (

            <div
              key={category}
              className="mb-3 flex items-center justify-between border-b pb-2"
            >
              <span>{category}</span>

              <span className="font-semibold text-blue-600">
                {formatCurrency(amount)}
              </span>

            </div>

          ))}

        </div>

        {/* Monthly */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="mb-4 text-xl font-bold">
            Monthly Report
          </h2>

          {Object.entries(monthlyReport).map(([month, amount]) => (

            <div
              key={month}
              className="mb-3 flex items-center justify-between border-b pb-2"
            >
              <span>{month}</span>

              <span className="font-semibold text-green-600">
                {formatCurrency(amount)}
              </span>

            </div>

          ))}

        </div>

      </div>

      {/* Transactions */}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-6 text-2xl font-bold">
          Transactions
        </h2>

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead>

              <tr className="border-b bg-slate-100">

                <th className="p-3 text-left">Title</th>

                <th className="p-3 text-left">Date</th>

                <th className="p-3 text-right">Amount</th>

              </tr>

            </thead>

            <tbody>

              {transactions.map((item) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="p-3">
                    {item.title}
                  </td>

                  <td className="p-3">
                    {formatDate(item.date)}
                  </td>

                  <td className="p-3 text-right font-semibold">

                    {formatCurrency(item.amount)}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  </div>
);