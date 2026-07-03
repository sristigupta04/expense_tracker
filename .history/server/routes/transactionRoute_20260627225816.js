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
router.post("/",getTransactions);
router.post("/",getTransactionsById);
router.post("/",updateTransaction);
router.post("/",deleteTransaction);
router.post("/",deleteTransactionById);


module.exports = router;