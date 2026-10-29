
const mongoose = require("mongoose");
const RecurringTransaction = require("../models/RecurringTransaction");
const Transaction = require("../models/Transaction");

const validFrequencies = ["weekly", "monthly", "yearly"];
const validTypes = ["income", "expense"];

function getNextDueDate(date, frequency) {
  const next = new Date(date);

  if (frequency === "weekly") {
    next.setDate(next.getDate() + 7);
  } else if (frequency === "monthly") {
    const originalDay = next.getDate();
    next.setDate(1);
    next.setMonth(next.getMonth() + 1);

    const lastDay = new Date(
      next.getFullYear(),
      next.getMonth() + 1,
      0
    ).getDate();

    next.setDate(Math.min(originalDay, lastDay));
  } else if (frequency === "yearly") {
    const month = next.getMonth();
    const day = next.getDate();
    next.setDate(1);
    next.setFullYear(next.getFullYear() + 1);
    next.setMonth(month);

    const lastDay = new Date(
      next.getFullYear(),
      month + 1,
      0
    ).getDate();

    next.setDate(Math.min(day, lastDay));
  }

  return next;
}

function validUser(req, res) {
  if (!req.user?.id || !mongoose.isValidObjectId(req.user.id)) {
    res.status(401).json({
      success: false,
      message: "Please log in again.",
    });
    return false;
  }

  return true;
}

// GET all recurring records
exports.getRecurringTransactions = async (req, res, next) => {
  try {
    if (!validUser(req, res)) return;

    const records = await RecurringTransaction.find({
      user: req.user.id,
    }).sort({ nextDueDate: 1 });

    res.json({ success: true, records });
  } catch (error) {
    next(error);
  }
};

// CREATE recurring record
exports.createRecurringTransaction = async (req, res, next) => {
  try {
    if (!validUser(req, res)) return;

    const {
      title,
      amount,
      type,
      category,
      frequency = "monthly",
      startDate,
      endDate,
      note = "",
    } = req.body;

    if (
      !title?.trim() ||
      !category?.trim() ||
      !validTypes.includes(type) ||
      !validFrequencies.includes(frequency) ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !startDate ||
      Number.isNaN(new Date(startDate).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid title, amount, type, category and start date.",
      });
    }

    if (endDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date.",
      });
    }

    const record = await RecurringTransaction.create({
      user: req.user.id,
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      frequency,
      startDate: new Date(startDate),
      nextDueDate: new Date(startDate),
      endDate: endDate || null,
      note: note.trim(),
    });

    res.status(201).json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

// UPDATE recurring record
exports.updateRecurringTransaction = async (req, res, next) => {
  try {
    if (!validUser(req, res)) return;

    const allowed = [
      "title",
      "amount",
      "type",
      "category",
      "frequency",
      "nextDueDate",
      "endDate",
      "note",
      "isActive",
    ];

    const updates = {};

    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.amount !== undefined) {
      updates.amount = Number(updates.amount);

      if (!Number.isFinite(updates.amount) || updates.amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than zero.",
        });
      }
    }

    if (
      updates.frequency !== undefined &&
      !validFrequencies.includes(updates.frequency)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid frequency.",
      });
    }

    if (updates.type !== undefined && !validTypes.includes(updates.type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction type.",
      });
    }

    if (updates.nextDueDate) {
      updates.nextDueDate = new Date(updates.nextDueDate);

      if (Number.isNaN(updates.nextDueDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid next due date.",
        });
      }
    }

    const record = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Recurring record not found.",
      });
    }

    res.json({ success: true, record });
  } catch (error) {
    next(error);
  }
};

// DELETE recurring record; historical transactions remain
exports.deleteRecurringTransaction = async (req, res, next) => {
  try {
    if (!validUser(req, res)) return;

    const record = await RecurringTransaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Recurring record not found.",
      });
    }

    res.json({
      success: true,
      message: "Recurring schedule deleted. Existing transactions were kept.",
    });
  } catch (error) {
    next(error);
  }
};

exports.markRecurringPaid = async (req, res, next) => {
  try {
    if (!validUser(req, res)) return;

    const record = await RecurringTransaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Recurring record not found.",
      });
    }

    if (!record.isActive) {
      return res.status(400).json({
        success: false,
        message: "This recurring schedule is paused.",
      });
    }

    const dueDate = new Date(record.nextDueDate);
    const occurrenceKey = `${record._id}:${dueDate.toISOString().slice(0, 10)}`;

    // Transaction schema must include recurringId and occurrenceKey.
    const transaction = await Transaction.findOneAndUpdate(
      {
        user: req.user.id,
        occurrenceKey,
      },
      {
        $setOnInsert: {
          user: req.user.id,
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
      { new: true, upsert: true, runValidators: true }
    );

    record.lastGeneratedDate = dueDate;

    const next = getNextDueDate(dueDate, record.frequency);
    record.nextDueDate = next;

    if (record.endDate && next > record.endDate) {
      record.isActive = false;
    }

    await record.save();

    res.json({
      success: true,
      message: "Payment recorded and next due date updated.",
      transaction,
      record,
    });
  } catch (error) {
    next(error);
  }
};