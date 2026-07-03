require("dotenv").config();
const express = require("express");
const cors = require("cors");
// const path = require("path");
const authRoutes = require("./routes/authRoute");
const transactionRoutes = require("./routes/transactionRoute");
const categoryRoutes = require("./routes/categoryRoute");
const budgetRoutes = require("./routes/budgetRoute");
const reportRoutes = require("./routes/reportRoute");

const app = express();
const port = process.env.PORT || 8080;
const MONGO_URL = process.env.MONGO_URL || "mongodb";
const mongoose = require("mongoose");

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("connected to mongo");

}
main().catch((err)=>{
    console.error("monog connection err",err);
});
main();
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));

app.use("/api/auth",authRoutes);
app.use("/api/transactions",transactionRoutes);
app.use("/api/categories",categoryRoutes);
app.use("/api/budget",budgetRoutes);
app.use("/api/reports",reportRoutes);


app.get("/",(re,res)=>{
  res.json({message:"welcome to the personal finace tracker api"});
})
app.use((req,res)=>{
    res.status(404).json({message:err.message});
})
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
