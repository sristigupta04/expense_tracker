const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    budgetlimit: {
      type: Number,
      required: true,
      min: 0,
    },

    month: {
      type: Number,
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Budget", budgetSchema);