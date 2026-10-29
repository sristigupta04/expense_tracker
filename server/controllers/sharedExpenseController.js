const mongoose = require("mongoose");
const User = require("../models/user");
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

function requireUser(req, res) {
  const userId = getUserId(req);

  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please log in again.",
    });
    return null;
  }

  return userId;
}

exports.createGroup = async (req, res, next) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const name = String(req.body.name || "").trim();
    const description = String(req.body.description || "").trim();
    const emails = Array.isArray(req.body.memberEmails)
      ? req.body.memberEmails
      : [];

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Group name is required.",
      });
    }

    const normalizedEmails = [
      ...new Set(
        emails
          .map((email) => String(email).trim().toLowerCase())
          .filter(Boolean)
      ),
    ];

    const users = normalizedEmails.length
      ? await User.find({
          email: { $in: normalizedEmails },
        }).select("_id email")
      : [];

    const foundEmails = new Set(
      users.map((user) => user.email.toLowerCase())
    );

    const missingEmails = normalizedEmails.filter(
      (email) => !foundEmails.has(email)
    );

    if (missingEmails.length) {
      return res.status(400).json({
        success: false,
        message: "Some emails are not registered.",
        missingEmails,
      });
    }

    const members = [
      ...new Set([
        String(userId),
        ...users.map((user) => String(user._id)),
      ]),
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

    return res.status(201).json({
      success: true,
      group: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.getGroups = async (req, res, next) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const groups = await SharedGroup.find({
      members: userId,
    })
      .populate("createdBy", "name email")
      .populate("members", "name email")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    next(error);
  }
};

exports.createSharedExpense = async (req, res, next) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

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
      return res.status(400).json({
        success: false,
        message: "Valid groupId is required.",
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim() ||
      totalAmount === "" ||
      totalAmount === null ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Title and a positive total amount are required.",
      });
    }

    if (!["equal", "custom", "percentage"].includes(splitType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid split type.",
      });
    }

    let expenseDate = new Date();

    if (date !== undefined && date !== null && date !== "") {
      expenseDate = new Date(date);

      if (Number.isNaN(expenseDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense date.",
        });
      }
    }

    const group = await getMemberGroup(groupId, userId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found.",
      });
    }

    const payerId = String(paidBy || userId);
    const memberIds = group.members.map((member) => String(member));

    if (!memberIds.includes(payerId)) {
      return res.status(400).json({
        success: false,
        message: "Payer must belong to this group.",
      });
    }

    let calculatedSplits = [];

    if (splitType === "equal") {
      const baseCents = Math.floor(
        Math.round(amount * 100) / memberIds.length
      );

      let remainingCents =
        Math.round(amount * 100) - baseCents * memberIds.length;

      calculatedSplits = memberIds.map((memberId) => {
        const extraCent = remainingCents > 0 ? 1 : 0;
        remainingCents -= extraCent;

        return {
          user: memberId,
          amount: (baseCents + extraCent) / 100,
          percentage: null,
        };
      });
    } else {
      if (
        !Array.isArray(splits) ||
        splits.length !== memberIds.length
      ) {
        return res.status(400).json({
          success: false,
          message: "Provide a split for every group member.",
        });
      }

      const suppliedIds = splits.map((split) => String(split.user));
      const uniqueIds = new Set(suppliedIds);

      if (
        uniqueIds.size !== memberIds.length ||
        !memberIds.every((id) => uniqueIds.has(id))
      ) {
        return res.status(400).json({
          success: false,
          message: "Each group member must appear exactly once in splits.",
        });
      }

      if (splitType === "custom") {
        const invalidAmount = splits.some(
          (split) =>
            split.amount === "" ||
            split.amount === null ||
            split.amount === undefined ||
            !Number.isFinite(Number(split.amount)) ||
            Number(split.amount) < 0
        );

        if (invalidAmount) {
          return res.status(400).json({
            success: false,
            message: "Invalid custom split amount.",
          });
        }

        calculatedSplits = splits.map((split) => ({
          user: String(split.user),
          amount: roundMoney(Number(split.amount)),
          percentage: null,
        }));

        const splitTotal = roundMoney(
          calculatedSplits.reduce(
            (sum, split) => sum + split.amount,
            0
          )
        );

        if (splitTotal !== roundMoney(amount)) {
          return res.status(400).json({
            success: false,
            message: "Custom split amounts must equal the total.",
            splitTotal,
            totalAmount: roundMoney(amount),
          });
        }
      } else {
        const invalidPercentage = splits.some((split) => {
          if (
            split.percentage === "" ||
            split.percentage === null ||
            split.percentage === undefined
          ) {
            return true;
          }

          const percentage = Number(split.percentage);

          return (
            !Number.isFinite(percentage) ||
            percentage < 0 ||
            percentage > 100
          );
        });

        if (invalidPercentage) {
          return res.status(400).json({
            success: false,
            message: "Each percentage must be between 0 and 100.",
          });
        }

        const percentageTotal = roundMoney(
          splits.reduce(
            (sum, split) => sum + Number(split.percentage),
            0
          )
        );

        if (percentageTotal !== 100) {
          return res.status(400).json({
            success: false,
            message: "Percentages must add up to exactly 100%.",
            percentageTotal,
          });
        }

        calculatedSplits = splits.map((split) => ({
          user: String(split.user),
          percentage: Number(split.percentage),
          amount: roundMoney(
            (amount * Number(split.percentage)) / 100
          ),
        }));

        const difference = roundMoney(
          amount -
            calculatedSplits.reduce(
              (sum, split) => sum + split.amount,
              0
            )
        );

        calculatedSplits[calculatedSplits.length - 1].amount =
          roundMoney(
            calculatedSplits[calculatedSplits.length - 1].amount +
              difference
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
      date: expenseDate,
      splitType,
      splits: calculatedSplits,
      note: typeof note === "string" ? note.trim() : "",
    });

    const populated = await SharedExpense.findById(expense._id)
      .populate("paidBy", "name email")
      .populate("createdBy", "name email")
      .populate("splits.user", "name email");

    return res.status(201).json({
      success: true,
      expense: populated,
    });
  } catch (error) {
    next(error);
  }
};

exports.getGroupExpenses = async (req, res, next) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const group = await getMemberGroup(req.params.groupId, userId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found.",
      });
    }

    const expenses = await SharedExpense.find({
      group: group._id,
    })
      .populate("paidBy", "name email")
      .populate("createdBy", "name email")
      .populate("splits.user", "name email")
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

exports.getGroupBalances = async (req, res, next) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const group = await getMemberGroup(req.params.groupId, userId);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found.",
      });
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
        roundMoney(
          (balances.get(payerId) || 0) + expense.totalAmount
        )
      );

      for (const split of expense.splits) {
        const memberId = String(split.user);

        balances.set(
          memberId,
          roundMoney(
            (balances.get(memberId) || 0) - split.amount
          )
        );
      }
    }

    for (const settlement of settlements) {
      const fromId = String(settlement.from);
      const toId = String(settlement.to);

      balances.set(
        fromId,
        roundMoney(
          (balances.get(fromId) || 0) + settlement.amount
        )
      );

      balances.set(
        toId,
        roundMoney(
          (balances.get(toId) || 0) - settlement.amount
        )
      );
    }

    const members = await User.find({
      _id: { $in: group.members },
    }).select("name email");

    const result = members.map((member) => ({
      user: member,
      balance: roundMoney(
        balances.get(String(member._id)) || 0
      ),
    }));

    return res.status(200).json({
      success: true,
      balances: result,
    });
  } catch (error) {
    next(error);
  }
};

exports.createSettlement = async (req, res, next) => {
  try {
    const userId = requireUser(req, res);
    if (!userId) return;

    const { groupId, to, amount, note } = req.body;
    const value = Number(amount);

    if (
      !mongoose.isValidObjectId(groupId) ||
      !mongoose.isValidObjectId(to)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid group or recipient.",
      });
    }

    if (
      amount === "" ||
      amount === null ||
      !Number.isFinite(value) ||
      value <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount must be positive.",
      });
    }

    if (String(userId) === String(to)) {
      return res.status(400).json({
        success: false,
        message: "You cannot settle with yourself.",
      });
    }

    const group = await getMemberGroup(groupId, userId);

    if (
      !group ||
      !group.members.some((member) => String(member) === String(to))
    ) {
      return res.status(404).json({
        success: false,
        message: "Group or recipient not found.",
      });
    }

    const settlement = await Settlement.create({
      group: group._id,
      from: userId,
      to,
      amount: roundMoney(value),
      note: typeof note === "string" ? note.trim() : "",
    });

    const populated = await Settlement.findById(settlement._id)
      .populate("from", "name email")
      .populate("to", "name email");

    return res.status(201).json({
      success: true,
      settlement: populated,
    });
  } catch (error) {
    next(error);
  }
};