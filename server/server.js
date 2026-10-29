
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
const notificationRoutes = require("./routes/notificationRoute");
const recurringTransactionRoutes = require("./routes/recurringTransactionRoute");
const sharedExpenseRoutes = require("./routes/sharedExpenseRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Personal Finance Tracker API Running",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/recurring-transactions", recurringTransactionRoutes);
app.use("/api/shared-expenses", sharedExpenseRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error("API Error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || err.statusCode || 500;

  res.status(status).json({
    success: false,
    message:
      status < 500
        ? err.message
        : "Internal server error.",
  });
});

// Start server after database connection
async function startServer() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is missing in server .env");
    }

    await mongoose.connect(process.env.MONGO_URL);

    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
