const { data } = require("react-router-dom");
const transaction = require("../models/Transaction");

module.exports.addTransaction = async(req, res)=>{
     const amount = req.body.amount;
     const type = req.body.type;
     const category = req.body.category;
     const Date = req.body.Date;
     const note = req.body.note;

     if(!amount || !type || !category || !Date ){

     }
     const Amount = new Transaction({
        amount,
        type,
        category,
        Date,
        note
     })
}