
const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    percentage: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
);

const sharedExpenseSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SharedGroup",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    category: {
      type: String,
      default: "Other",
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    splitType: {
      type: String,
      enum: ["equal", "custom", "percentage"],
      required: true,
    },
    splits: {
      type: [splitSchema],
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

sharedExpenseSchema.index({ group: 1, date: -1 });

module.exports =
  mongoose.models.SharedExpense ||
  mongoose.model("SharedExpense", sharedExpenseSchema);
