require("dotenv").config();


const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("connect-flash");
const Userroute = require("./routes/authRoute");
const { model, default: mongoose } = require("mongoose");
const User = require("./model/user.js");


const app = express();
const port = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || "mongodb";


async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("connected to mongo");

}
main().catch((err)=>{
    console.error("monog connection err",err);
});



app.use("/",authRoutes);
app.use("/",incomeRoutes);
app.use("/",expenseRoutes);
app.use("/",dashboardRoutes);



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
