require("dotenv").config();


const express = require("express");
const cors = require("cors");
const path = require("path");
const { model, default: mongoose } = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const incomeRoutes = require("./routes/incomeRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

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

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
connectDB();

app.use("/",authRoutes);
app.use("/",incomeRoutes);
app.use("/",expenseRoutes);
app.use("/",dashboardRoutes);



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
