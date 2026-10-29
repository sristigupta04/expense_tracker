
const mongoose = require("mongoose");
const User = require("../models/User");
const SharedGroup = require("../models/SharedGroup");
const SharedExpense = require("../models/SharedExpense");
const Settlement = require("../models/Settlement");

const roundMoney = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const getUserId = (req) => req.user?.id || req.user?._id;

async function getMemberGroup(groupId, userId) {
  if (!mongoose.isValidObjectId(groupId)) return null;

  return SharedGroup.findOne({
    _id: groupId,
    members: userId,
  });
}

// Create a group. Members are invited by registered email.
exports.createGroup = async (req, res) => {
  try {
    const userId = getUserId(req);
    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const emails = Array.isArray(req.body.memberEmails)
      ? req.body.memberEmails
      : [];

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const normalizedEmails = [
      ...new Set(
        emails
          .map((email) => String(email).trim().toLowerCase())
          .filter(Boolean)
      ),
    ];

    const users = normalizedEmails.length
      ? await User.find({ email: { $in: normalizedEmails } }).select("_id email")
      : [];

    const foundEmails = new Set(users.map((user) => user.email.toLowerCase()));
    const missingEmails = normalizedEmails.filter(
      (email) => !foundEmails.has(email)
    );

    if (missingEmails.length) {
      return res.status(400).json({
        message: "Some emails are not registered",
        missingEmails,
      });
    }

    const members = [
      ...new Set(
        [String(userId), ...users.map((user) => String(user._id))]
      ),
    ];

    const group = await SharedGroup.create({
      name,
      description,
      createdBy: userId,
      members,
    });

    const populated = await SharedGroup.findById(group._id)
      .populate("createdBy", "name email")
      .populate("members", "name email");

    return res.status(201).json({ group: populated });
  } catch (error) {
    console.error("Create shared group:", error);
    return res.status(500).json({ message: "Could not create group" });
  }
};

// Get only groups the current user belongs to.
exports.getGroups = async (req, res) => {
  try {
    const userId = getUserId(req);
    const groups = await SharedGroup.find({ members: userId })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ updatedAt: -1 });

    return res.json({ groups });
  } catch (error) {
    console.error("Get shared groups:", error);
    return res.status(500).json({ message: "Could not load groups" });
  }
};

// Create an expense and calculate the member shares.
exports.createSharedExpense = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      groupId,
      title,
      totalAmount,
      paidBy,
      category,
      date,
      splitType,
      splits,
      note,
    } = req.body;

    const amount = Number(totalAmount);

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(400).json({ message: "Valid groupId is required" });
    }

    if (!title?.trim() || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Title and a positive total amount are required",
      });
    }

    if (!["equal", "custom", "percentage"].includes(splitType)) {
      return res.status(400).json({ message: "Invalid split type" });
    }

    const group = await getMemberGroup(groupId, userId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const payerId = String(paidBy || userId);

    if (!group.members.some((member) => String(member) === payerId)) {
      return res.status(400).json({
        message: "Payer must belong to this group",
      });
    }

    const memberIds = group.members.map(String);
    let calculatedSplits = [];

    if (splitType === "equal") {
      const base = Math.floor((amount / memberIds.length) * 100) / 100;
      let remainingCents = Math.round(amount * 100) -
        Math.round(base * 100) * memberIds.length;

      calculatedSplits = memberIds.map((memberId) => {
        const extraCent = remainingCents > 0 ? 1 : 0;
        remainingCents -= extraCent;

        return {
          user: memberId,
          amount: roundMoney(base + extraCent / 100),
          percentage: null,
        };
      });
    } else {
      if (!Array.isArray(splits) || splits.length !== memberIds.length) {
        return res.status(400).json({
          message: "Provide a split for every group member",
        });
      }

      const suppliedIds = splits.map((split) => String(split.user));
      const uniqueIds = new Set(suppliedIds);

      if (
        uniqueIds.size !== memberIds.length ||
        !memberIds.every((id) => uniqueIds.has(id))
      ) {
        return res.status(400).json({
          message: "Each group member must appear exactly once in splits",
        });
      }

      if (
        splits.some(
          (split) =>
            !Number.isFinite(Number(split.amount)) ||
            Number(split.amount) < 0
        )
      ) {
        return res.status(400).json({ message: "Invalid split amount" });
      }

      if (splitType === "custom") {
        calculatedSplits = splits.map((split) => ({
          user: String(split.user),
          amount: roundMoney(Number(split.amount)),
          percentage: null,
        }));

        const sum = roundMoney(
          calculatedSplits.reduce((total, split) => total + split.amount, 0)
        );

        if (sum !== roundMoney(amount)) {
          return res.status(400).json({
            message: "Custom split amounts must equal the total",
            splitTotal: sum,
            totalAmount: roundMoney(amount),
          });
        }
      } else {
        const percentages = splits.map((split) => Number(split.percentage));

        if (
          percentages.some(
            (percentage) =>
              !Number.isFinite(percentage) ||
              percentage < 0 ||
              percentage > 100
          ) ||
          roundMoney(percentages.reduce((sum, value) => sum + value, 0)) !== 100
        ) {
          return res.status(400).json({
            message: "Percentages must add up to exactly 100%",
          });
        }

        calculatedSplits = splits.map((split) => ({
          user: String(split.user),
          percentage: Number(split.percentage),
          amount: roundMoney(
            (amount * Number(split.percentage)) / 100
          ),
        }));

        // Correct any rounding difference on the final share.
        const difference = roundMoney(
          amount -
            calculatedSplits.reduce((sum, split) => sum + split.amount, 0)
        );

        calculatedSplits[calculatedSplits.length - 1].amount = roundMoney(
          calculatedSplits[calculatedSplits.length - 1].amount + difference
        );
      }
    }

    const expense = await SharedExpense.create({
      group: group._id,
      createdBy: userId,
      paidBy: payerId,
      title: title.trim(),
      totalAmount: roundMoney(amount),
      category: category || "Other",
      date: date ? new Date(date) : new Date(),
      splitType,
      splits: calculatedSplits,
      note: note || "",
    });

    const populated = await SharedExpense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("createdBy", "name email")
      .populate("splits.user", "name email");

    return res.status(201).json({ expense: populated });
  } catch (error) {
    console.error("Create shared expense:", error);
    return res.status(500).json({ message: "Could not create expense" });
  }
};

// List group expenses.
exports.getGroupExpenses = async (req, res) => {
  try {
    const userId = getUserId(req);
    const group = await getMemberGroup(req.params.groupId, userId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const expenses = await SharedExpense.find({ group: group._id })
      .populate("paidBy", "name email")
      .populate("createdBy", "name email")
      .populate("splits.user", "name email")
      .sort({ date: -1, createdAt: -1 });

    return res.json({ expenses });
  } catch (error) {
    console.error("Get group expenses:", error);
    return res.status(500).json({ message: "Could not load expenses" });
  }
};

// Calculate current net balance for each member.
// Positive = should receive; negative = owes money.
exports.getGroupBalances = async (req, res) => {
  try {
    const userId = getUserId(req);
    const group = await getMemberGroup(req.params.groupId, userId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const [expenses, settlements] = await Promise.all([
      SharedExpense.find({ group: group._id }),
      Settlement.find({ group: group._id }),
    ]);

    const balances = new Map(
      group.members.map((member) => [String(member), 0])
    );

    for (const expense of expenses) {
      const payerId = String(expense.paidBy);
      balances.set(
        payerId,
        roundMoney((balances.get(payerId) || 0) + expense.totalAmount)
      );

      for (const split of expense.splits) {
        const memberId = String(split.user);
        balances.set(
          memberId,
          roundMoney((balances.get(memberId) || 0) - split.amount)
        );
      }
    }

    for (const settlement of settlements) {
      const fromId = String(settlement.from);
      const toId = String(settlement.to);

      balances.set(
        fromId,
        roundMoney((balances.get(fromId) || 0) + settlement.amount)
      );
      balances.set(
        toId,
        roundMoney((balances.get(toId) || 0) - settlement.amount)
      );
    }

    const members = await User.find({
      _id: { $in: group.members },
    }).select("name email");

    const result = members.map((member) => ({
      user: member,
      balance: roundMoney(balances.get(String(member._id)) || 0),
    }));

    return res.json({ balances: result });
  } catch (error) {
    console.error("Get group balances:", error);
    return res.status(500).json({ message: "Could not calculate balances" });
  }
};

// Record a transfer from the logged-in member to another group member.
// This records the transfer; it does not initiate a bank/UPI payment.
exports.createSettlement = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { groupId, to, amount, note } = req.body;
    const value = Number(amount);

    if (!mongoose.isValidObjectId(groupId) ||
        !mongoose.isValidObjectId(to)) {
      return res.status(400).json({ message: "Invalid group or recipient" });
    }

    if (!Number.isFinite(value) || value <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    if (String(userId) === String(to)) {
      return res.status(400).json({
        message: "You cannot settle with yourself",
      });
    }

    const group = await getMemberGroup(groupId, userId);

    if (!group || !group.members.some((member) => String(member) === String(to))) {
      return res.status(404).json({ message: "Group or recipient not found" });
    }

    const settlement = await Settlement.create({
      group: group._id,
      from: userId,
      to,
      amount: roundMoney(value),
      note: note || "",
    });

    const populated = await Settlement.findById(settlement._id)
      .populate("from", "name email")
      .populate("to", "name email");

    return res.status(201).json({ settlement: populated });
  } catch (error) {
    console.error("Create settlement:", error);
    return res.status(500).json({ message: "Could not record settlement" });
  }
};
