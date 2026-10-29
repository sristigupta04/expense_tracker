const mongoose = require("mongoose");

const recurringTransactionSchema = new mongoose.Schema(
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
    },
    frequency: {
      type: String,
      enum: ["weekly", "monthly", "yearly"],
      default: "monthly",
    },
    startDate: {
      type: Date,
      required: true,
    },
    nextDueDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastGeneratedDate: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

recurringTransactionSchema.index({
  user: 1,
  isActive: 1,
  nextDueDate: 1,
});

module.exports =
  mongoose.models.RecurringTransaction ||
  mongoose.model("RecurringTransaction", recurringTransactionSchema);