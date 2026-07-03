const cron = require("node-cron");
const Transaction = require("../models/Transaction");


module.exports.startCron = () =>{
    cron.schedule("0 0 1 * *",async () =>{

    });
};