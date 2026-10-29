const mongoose = require("mongoose");

const savingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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
      validate: {
        validator(value) {
          return value <= this.target;
        },
        message: "Saved amount cannot exceed the target.",
      },
    },

    deadline: {
      type: Date,
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

savingSchema.index({ user: 1, createdAt: -1 });

module.exports =
  mongoose.models.Saving || mongoose.model("Saving", savingSchema);