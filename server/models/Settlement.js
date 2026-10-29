const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SharedGroup",
      required: true,
      index: true,
    },

    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    note: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

settlementSchema.pre("validate", function (next) {
  if (this.from && this.to && this.from.equals(this.to)) {
    this.invalidate("to", "Payer and receiver must be different users.");
  }
  next();
});

settlementSchema.index({ group: 1, date: -1 });

module.exports =
  mongoose.models.Settlement ||
  mongoose.model("Settlement", settlementSchema);