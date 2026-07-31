require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const authRoutes = require("./routes/authRoute");
const transactionRoutes = require("./routes/transactionRoute");
const categoryRoutes = require("./routes/categoryRoute");
const budgetRoutes = require("./routes/budgetRoute");
const reportRoutes = require("./routes/reportRoute");

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// Database Connection
// ======================
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
  });

// ======================
// Middleware
// ======================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
// Routes
// ======================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Personal Finance Tracker API Running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/budget", budgetRoutes);

// IMPORTANT
app.use("/api/report", reportRoutes);

// ======================
// 404
// ======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// ======================
// Error Handler
// ======================
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message,
  });
});

// ======================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});