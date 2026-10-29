
const mongoose = require("mongoose");

const savingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    target: {
      type: Number,
      required: true,
      min: 1,
    },

    saved: {
      type: Number,
      default: 0,
      min: 0,
    },

    deadline: {
      type: Date,
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

savingSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Saving", savingSchema);
