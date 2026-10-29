
const mongoose = require("mongoose");
const Category = require("../models/Category");

const getUserId = (req, res) => {
  const userId = req.user?.id || req.user?._id;

  if (!userId || !mongoose.isValidObjectId(userId)) {
    res.status(401).json({
      success: false,
      message: "Invalid user session. Please log in again.",
    });
    return null;
  }

  return userId;
};

// GET /api/categories
exports.getCategories = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const categories = await Category.find({ user: userId }).sort({
      name: 1,
    });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:id
exports.getCategoryById = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.status(200).json({ success: true, category });
  } catch (error) {
    next(error);
  }
};

// POST /api/categories
exports.createCategory = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    const { name, type, color, icon } = req.body;

    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required.",
      });
    }

    const categoryData = {
      name: name.trim(),
      user: userId,
    };

    if (type !== undefined) categoryData.type = type;
    if (color !== undefined) categoryData.color = color;
    if (icon !== undefined) categoryData.icon = icon;

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: "Category created successfully.",
      category,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    const allowedFields = ["name", "type", "color", "icon"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.name !== undefined &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "Category name cannot be empty.",
      });
    }

    if (updates.name !== undefined) {
      updates.name = updates.name.trim();
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      category,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const userId = getUserId(req, res);
    if (!userId) return;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID.",
      });
    }

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: userId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
