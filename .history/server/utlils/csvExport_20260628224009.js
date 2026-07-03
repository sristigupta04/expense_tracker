


const {Parser} = require("json2csv");
const Transaction = require("../models/Transaction");
module.exports.exportCSV = async(req,res)=>{
    const transactions = await Transaction.find();
  const fields =[
    "amount",
    "type",
    "category",
    "date",
    "note",
  ];
  const parser = new Parser({fields});
  const csv = parser.parse(transactions);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
}