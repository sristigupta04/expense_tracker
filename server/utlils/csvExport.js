const { Parser } = require("json2csv");
const Transaction = require("../models/Transaction");

module.exports.exportCSV = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const transactions = await Transaction.find({ user: userId })
      .select("title amount type category date note")
      .sort({ date: -1 })
      .lean();

    const fields = [
      { label: "Title", value: "title" },
      { label: "Amount", value: "amount" },
      { label: "Type", value: "type" },
      { label: "Category", value: "category" },
      { label: "Date", value: "date" },
      { label: "Note", value: "note" },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(transactions);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="transactions.csv"'
    );

    return res.status(200).send("\uFEFF" + csv);
  } catch (error) {
    return next(error);
  }
};