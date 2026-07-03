const express = require("express");
const router = express.Router();

const {
    addTransaction,
    getTransactions,
    getTransactionsById,
    updateTransaction,
    deleteTransaction,
    deleteTransactionById
}= require("../controllers/transactionController");
const { route } = require("./authRoute");




router.post("/",addTransaction);
router.get("/",getTransactions);
router.get("/:id",getTransactionsById);
router.put("/:id",updateTransaction);
router.delete("/",deleteTransaction);
router.delete("/:id",deleteTransactionById);


module.exports = router;