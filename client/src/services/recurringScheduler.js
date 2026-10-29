const cron = require("node-cron");
const RecurringTransaction = require("../models/RecurringTransaction");
const Transaction = require("../models/Transaction");

function getNextDueDate(date, frequency) {
  const next = new Date(date);

  if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
    return next;
  }

  const originalDay = next.getDate();
  const targetMonth =
    next.getMonth() + (frequency === "monthly" ? 1 : 12);

  next.setDate(1);
  next.setMonth(targetMonth);

  const lastDay = new Date(
    next.getFullYear(),
    next.getMonth() + 1,
    0
  ).getDate();

  next.setDate(Math.min(originalDay, lastDay));
  return next;
}

async function processRecurringTransactions() {
  const now = new Date();

  const dueRecords = await RecurringTransaction.find({
    isActive: true,
    nextDueDate: { $lte: now },
  });

  for (const record of dueRecords) {
    try {
      // Process overdue occurrences in order; unique key prevents duplicates.
      let dueDate = new Date(record.nextDueDate);
      let processed = 0;

      while (dueDate <= now && processed < 100) {
        if (record.endDate && dueDate > record.endDate) {
          record.isActive = false;
          break;
        }

        const occurrenceKey =
          `${record._id}:${dueDate.toISOString().slice(0, 10)}`;

        await Transaction.updateOne(
          { user: record.user, occurrenceKey },
          {
            $setOnInsert: {
              user: record.user,
              title: record.title,
              amount: record.amount,
              type: record.type,
              category: record.category,
              date: dueDate,
              note: record.note || "",
              recurringId: record._id,
              occurrenceKey,
            },
          },
          { upsert: true }
        );

        record.lastGeneratedDate = dueDate;
        dueDate = getNextDueDate(dueDate, record.frequency);
        processed += 1;
      }

      record.nextDueDate = dueDate;

      if (record.endDate && dueDate > record.endDate) {
        record.isActive = false;
      }

      await record.save();
    } catch (error) {
      console.error(
        `Recurring schedule ${record._id} failed:`,
        error.message
      );
    }
  }
}

function startRecurringScheduler() {
  // Runs every day at 00:05 in the server's local timezone.
  cron.schedule("5 0 * * *", () => {
    processRecurringTransactions().catch(console.error);
  });

  // Process any schedules that are already due when the server starts.
  processRecurringTransactions().catch(console.error);
}

module.exports = { startRecurringScheduler, processRecurringTransactions };