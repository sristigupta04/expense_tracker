const cron = require("node-cron");
const Transaction = require("../models/Transaction");

module.exports.startCron = () => {

  // Every month on the 1st at 12:00 AM
  cron.schedule("0 0 1 * *", async () => {

    try {

      // Find all recurring transactions
      const recurringTransactions = await Transaction.find({
        isRecurring: true,
      });

      // Loop through all recurring transactions
      for (const transaction of recurringTransactions) {

        // Create a new transaction
        const newTransaction = new Transaction({
          amount: transaction.amount,
          type: transaction.type,
          category: transaction.category,
          date: new Date(),
          note: transaction.note,
          isRecurring: transaction.isRecurring,
          recurringInterval: transaction.recurringInterval,
        });

        // Save transaction
        await newTransaction.save();
      }

      console.log("✅ Recurring Transactions Added Successfully");

    } catch (err) {

      console.log("❌ Cron Job Error");
      console.log(err.message);

    }

  });

};