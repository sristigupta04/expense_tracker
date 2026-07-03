


const {Parser} = require("json2csv");

module.exports.exportCSV = async(req,res)=>{
    const transaction = await Transaction.find();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
}