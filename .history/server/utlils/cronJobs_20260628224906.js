const cron = require("node-cron");
const Transaction = require("../models/Transaction");


module.exports.startCron = () =>{
    cron.schedule("0 0 1 * *",async () =>{
const date = new Date();
const min = Date.getMinutes();
const hour = now.getHours();
const seconds = now.getSeconds();
    });
};