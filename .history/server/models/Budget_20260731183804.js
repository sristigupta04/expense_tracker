const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const BudgetSchema = new Schema({
    comment:{
        type:String,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
     category:{
        type:String,
        enum:['food','travel','shopping','rent'],
        required:true,
     },
     budgetlimit:{
          type:Number,const mongoose = require("mongoose");

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
        required:true,
     },
     month:{
         type:Number,
        required:true,
     },
     year:{
      type:Number,
        required:true
     }
});
module.exports = mongoose.model("Budget",BudgetSchema);