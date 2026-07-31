const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      default: "",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      enum: ["food", "travel", "shopping", "rent"],
      required: true,
    },

    budgetlimit: {
      type: Number,
      required: true,
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