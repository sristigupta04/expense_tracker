
const mongoose = require("mongoose");
const Saving = require("../models/saving");

// GET /api/saving-goals
const getSavingGoals = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const goals = await Saving.find({ user: userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: goals.length,
      goals,
    });
  } catch (error) {
    console.error("Get saving goals error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saving goals",
    });
  }
};

// POST /api/saving-goals
const createSavingGoal = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, target, saved = 0, deadline } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!name?.trim() || target === undefined) {
      return res.status(400).json({
        success: false,
        message: "Goal name and target amount are required",
      });
    }

    const targetAmount = Number(target);
    const savedAmount = Number(saved);

    if (!Number.isFinite(targetAmount) || targetAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Target must be greater than zero",
      });
    }

    if (
      !Number.isFinite(savedAmount) ||
      savedAmount < 0 ||
      savedAmount > targetAmount
    ) {
      return res.status(400).json({
        success: false,
        message: "Saved amount must be between zero and target",
      });
    }

    let parsedDeadline = null;

    if (deadline) {
      parsedDeadline = new Date(deadline);

      if (Number.isNaN(parsedDeadline.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid deadline",
        });
      }
    }

    const goal = await Saving.create({
      user: userId,
      name: name.trim(),
      target: targetAmount,
      saved: savedAmount,
      deadline: parsedDeadline,
    });

    return res.status(201).json({
      success: true,
      message: "Saving goal created successfully",
      goal,
    });
  } catch (error) {
    console.error("Create saving goal error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create saving goal",
    });
  }
};

// PUT /api/saving-goals/:id
const updateSavingGoal = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { name, target, saved, deadline } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid saving goal ID",
      });
    }

    const goal = await Saving.findOne({ _id: id, user: userId });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Saving goal not found",
      });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Goal name cannot be empty",
        });
      }
      goal.name = name.trim();
    }

    if (target !== undefined) {
      const amount = Number(target);

      if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Target must be greater than zero",
        });
      }
      goal.target = amount;
    }

    if (saved !== undefined) {
      const amount = Number(saved);

      if (!Number.isFinite(amount) || amount < 0) {
        return res.status(400).json({
          success: false,
          message: "Saved amount cannot be negative",
        });
      }
      goal.saved = amount;
    }

    if (goal.saved > goal.target) {
      return res.status(400).json({
        success: false,
        message: "Saved amount cannot exceed the target",
      });
    }

    if (deadline !== undefined) {
      if (deadline === null || deadline === "") {
        goal.deadline = null;
      } else {
        const parsedDeadline = new Date(deadline);

        if (Number.isNaN(parsedDeadline.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid deadline",
          });
        }

        goal.deadline = parsedDeadline;
      }
    }

    await goal.save();

    return res.status(200).json({
      success: true,
      message: "Saving goal updated successfully",
      goal,
    });
  } catch (error) {
    console.error("Update saving goal error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update saving goal",
    });
  }
};

// DELETE /api/saving-goals/:id
const deleteSavingGoal = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid saving goal ID",
      });
    }

    const goal = await Saving.findOneAndDelete({
      _id: id,
      user: userId,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Saving goal not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Saving goal deleted successfully",
    });
  } catch (error) {
    console.error("Delete saving goal error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete saving goal",
    });
  }
};

module.exports = {
  getSavingGoals,
  createSavingGoal,
  updateSavingGoal,
  deleteSavingGoal,
};
