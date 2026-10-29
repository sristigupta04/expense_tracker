"use strict";

const mongoose = require("mongoose");
const RecurringTransaction = require("../models/RecurringTransaction");
const Transaction = require("../models/Transaction");

const validFrequencies = ["weekly", "monthly", "yearly"];
const validTypes = ["income", "expense"];

function getUserId(req) {
  const userId = req.user?.id || req.user?._id;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    return null;
  }

  return userId;
}

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
    const originalMonth = next.getMonth();
    const originalDay = next.getDate();

    next.setDate(1);
    next.setFullYear(next.getFullYear() + 1);
    next.setMonth(originalMonth);

    const lastDay = new Date(
      next.getFullYear(),
      originalMonth + 1,
      0
    ).getDate();

    next.setDate(Math.min(originalDay, lastDay));
  }

  return next;
}

function sendError(res, status, message) {
  return res.status(status).json({
    success: false,
    message,
  });
}

// GET /api/recurring-transactions
exports.getRecurringTransactions = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return sendError(res, 401, "Please log in again.");
    }

    const records = await RecurringTransaction.find({
      user: userId,
    }).sort({ nextDueDate: 1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/recurring-transactions
exports.createRecurringTransaction = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return sendError(res, 401, "Please log in again.");
    }

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
      typeof title !== "string" ||
      !title.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      !validTypes.includes(type) ||
      !validFrequencies.includes(frequency) ||
      amount === "" ||
      amount === null ||
      amount === undefined ||
      !Number.isFinite(Number(amount)) ||
      Number(amount) <= 0 ||
      !startDate
    ) {
      return sendError(
        res,
        400,
        "Please provide valid title, amount, type, category, frequency and start date."
      );
    }

    const parsedStartDate = new Date(startDate);

    if (Number.isNaN(parsedStartDate.getTime())) {
      return sendError(res, 400, "Invalid start date.");
    }

    let parsedEndDate = null;

    if (endDate !== undefined && endDate !== null && endDate !== "") {
      parsedEndDate = new Date(endDate);

      if (
        Number.isNaN(parsedEndDate.getTime()) ||
        parsedEndDate < parsedStartDate
      ) {
        return sendError(
          res,
          400,
          "End date must be valid and cannot precede start date."
        );
      }
    }

    if (typeof note !== "string") {
      return sendError(res, 400, "Note must be text.");
    }

    const record = await RecurringTransaction.create({
      user: userId,
      title: title.trim(),
      amount: Number(amount),
      type,
      category: category.trim(),
      frequency,
      startDate: parsedStartDate,
      nextDueDate: parsedStartDate,
      endDate: parsedEndDate,
      note: note.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Recurring transaction created successfully.",
      record,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/recurring-transactions/:id
exports.updateRecurringTransaction = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return sendError(res, 401, "Please log in again.");
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid recurring transaction ID.");
    }

    const allowedFields = [
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

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return sendError(res, 400, "No valid fields provided to update.");
    }

    if (updates.title !== undefined) {
      if (typeof updates.title !== "string" || !updates.title.trim()) {
        return sendError(res, 400, "Title cannot be empty.");
      }

      updates.title = updates.title.trim();
    }

    if (updates.category !== undefined) {
      if (
        typeof updates.category !== "string" ||
        !updates.category.trim()
      ) {
        return sendError(res, 400, "Category cannot be empty.");
      }

      updates.category = updates.category.trim();
    }

    if (updates.note !== undefined) {
      if (typeof updates.note !== "string") {
        return sendError(res, 400, "Note must be text.");
      }

      updates.note = updates.note.trim();
    }

    if (updates.amount !== undefined) {
      if (
        updates.amount === "" ||
        updates.amount === null ||
        !Number.isFinite(Number(updates.amount)) ||
        Number(updates.amount) <= 0
      ) {
        return sendError(res, 400, "Amount must be greater than zero.");
      }

      updates.amount = Number(updates.amount);
    }

    if (
      updates.frequency !== undefined &&
      !validFrequencies.includes(updates.frequency)
    ) {
      return sendError(res, 400, "Invalid frequency.");
    }

    if (
      updates.type !== undefined &&
      !validTypes.includes(updates.type)
    ) {
      return sendError(res, 400, "Invalid transaction type.");
    }

    for (const field of ["nextDueDate", "endDate"]) {
      if (updates[field] === undefined) continue;

      if (updates[field] === null || updates[field] === "") {
        if (field === "endDate") {
          updates[field] = null;
          continue;
        }

        return sendError(res, 400, "Next due date is required.");
      }

      const parsedDate = new Date(updates[field]);

      if (Number.isNaN(parsedDate.getTime())) {
        return sendError(res, 400, `Invalid ${field}.`);
      }

      updates[field] = parsedDate;
    }

    if (
      updates.isActive !== undefined &&
      typeof updates.isActive !== "boolean"
    ) {
      return sendError(res, 400, "isActive must be true or false.");
    }

    const existing = await RecurringTransaction.findOne({
      _id: id,
      user: userId,
    });

    if (!existing) {
      return sendError(res, 404, "Recurring transaction not found.");
    }

    const resultingNextDueDate =
      updates.nextDueDate || existing.nextDueDate;

    const resultingEndDate =
      updates.endDate !== undefined
        ? updates.endDate
        : existing.endDate;

    if (
      resultingEndDate &&
      resultingNextDueDate > resultingEndDate
    ) {
      return sendError(
        res,
        400,
        "Next due date cannot be after the end date."
      );
    }

    const record = await RecurringTransaction.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Recurring transaction updated successfully.",
      record,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/recurring-transactions/:id
exports.deleteRecurringTransaction = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return sendError(res, 401, "Please log in again.");
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid recurring transaction ID.");
    }

    const record = await RecurringTransaction.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!record) {
      return sendError(res, 404, "Recurring transaction not found.");
    }

    return res.status(200).json({
      success: true,
      message: "Recurring schedule deleted. Existing transactions were kept.",
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/recurring-transactions/:id/paid
exports.markRecurringPaid = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return sendError(res, 401, "Please log in again.");
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return sendError(res, 400, "Invalid recurring transaction ID.");
    }

    const record = await RecurringTransaction.findOne({
      _id: id,
      user: userId,
    });

    if (!record) {
      return sendError(res, 404, "Recurring transaction not found.");
    }

    if (!record.isActive) {
      return sendError(res, 400, "This recurring schedule is paused.");
    }

    const dueDate = new Date(record.nextDueDate);

    if (Number.isNaN(dueDate.getTime())) {
      return sendError(res, 400, "The recurring schedule has an invalid due date.");
    }

    if (record.endDate && dueDate > new Date(record.endDate)) {
      await RecurringTransaction.updateOne(
        { _id: record._id, user: userId, nextDueDate: record.nextDueDate },
        { $set: { isActive: false } }
      );

      return sendError(res, 400, "This recurring schedule has ended.");
    }

    const occurrenceKey =
      `${record._id}:${dueDate.toISOString().slice(0, 10)}`;

    let transaction;

    try {
      transaction = await Transaction.findOneAndUpdate(
        { user: userId, occurrenceKey },
        {
          $setOnInsert: {
            user: userId,
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
    } catch (error) {
      if (error.code === 11000) {
        transaction = await Transaction.findOne({
          user: userId,
          occurrenceKey,
        });
      }

      if (!transaction) throw error;
    }

    const nextDueDate = getNextDueDate(dueDate, record.frequency);

    const updates = {
      lastGeneratedDate: dueDate,
      nextDueDate,
    };

    if (record.endDate && nextDueDate > new Date(record.endDate)) {
      updates.isActive = false;
    }

    const updatedRecord = await RecurringTransaction.findOneAndUpdate(
      {
        _id: record._id,
        user: userId,
        nextDueDate: record.nextDueDate,
        isActive: true,
      },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return res.status(409).json({
        success: false,
        message:
          "This payment was already processed or the schedule changed. Refresh and check the latest status.",
        transaction,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment recorded and next due date updated.",
      transaction,
      record: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};