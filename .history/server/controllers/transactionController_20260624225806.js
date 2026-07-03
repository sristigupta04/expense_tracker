const transaction = require("../models/Transaction");

module.exports.addTransaction = async(req, res)=>{
     const amount = req.body.amount;
     const type = req.body.type;
     const category = req.body.category;
     const Date = req.body.Date;
     const note = req.body.note;
}