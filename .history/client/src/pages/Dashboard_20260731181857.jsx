return (
  <>
    <Navbar />

    {loading && <Loader />}

    <main className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800">
            Dashboard
          </h1>

          <p className="text-slate-500 mt-2">
            Welcome back! Here's your financial overview.
          </p>
        </div>

        {/* Summary */}
        <section className="mb-8">
          <SummaryCard
            balance={balance}
            income={income}
            expense={expense}
          />
        </section>

        {/* Form + Recent Transactions */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-5">
                Add Transaction
              </h2>

              <TransactionForm
                addTransaction={addExpense}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-5">
                Recent Transactions
              </h2>

              <TransactionTable
                transactions={transactions}
                deleteTransaction={removeExpense}
              />
            </div>
          </div>

        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-lg font-semibold mb-4">
              Category Distribution
            </h2>

            <CategoryChart
              transactions={transactions}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-lg font-semibold mb-4">
              Expense Analysis
            </h2>

            <ExpenseChart
              transactions={transactions}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-lg font-semibold mb-4">
              Income Analysis
            </h2>

            <IncomeChart
              transactions={transactions}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5">
            <h2 className="text-lg font-semibold mb-4">
              Monthly Overview
            </h2>

            <MonthlyChart
              transactions={transactions}
            />
          </div>

        </section>

      </div>
    </main>
  </>
);