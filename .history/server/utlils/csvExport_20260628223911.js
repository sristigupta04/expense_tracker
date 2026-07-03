


const {Parser} = require("json2csv");
const transaction = require("../models/Transaction");
module.exports.exportCSV = async(req,res)=>{
    const transaction = await Transaction.find();
  const fields =[
    "amount",
    "type",
    "category",
    "date",
    "note",
  ]
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
}