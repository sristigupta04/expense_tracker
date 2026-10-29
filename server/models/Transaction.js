const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
    recurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringTransaction",
      default: undefined,
    },
    occurrenceKey: {
      type: String,
      default: undefined,
    },
  },
  { timestamps: true }
);

transactionSchema.index(
  { user: 1, occurrenceKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      occurrenceKey: { $type: "string" },
    },
  }
);

module.exports =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);