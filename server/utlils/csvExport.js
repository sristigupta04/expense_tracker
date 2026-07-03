


const {Parser} = require("json2csv");
const Transaction = require("../models/Transaction");
module.exports.exportCSV = async(req,res)=>{
    try{
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

  res.header("content-Type","text/csv");
  res.attachment("transactions.csv");
  return res.send(csv);


}catch(err){
res.status(500).json({message:err.message});
}
}