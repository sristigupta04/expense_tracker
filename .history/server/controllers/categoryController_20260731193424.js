const Category = require("../models/category");

// Create Category
module.exports.createCategory = async (req, res) => {
  try {
    const { name, color, icon } = req.body;

    if (!name || !color || !icon) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const existingCategory = await Category.findOne({ name });

    if (existingCategory) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      color,
      icon,
    });

    res.status(201).json(category);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get All Categories
module.exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Get Category By Id
module.exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json(category);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Update Category
module.exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json(category);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// Delete Category
module.exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(
      req.params.id
    );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};