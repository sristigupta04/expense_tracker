const express = require("express");
const router = express.router();


const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
}= require("../controllers/categoryController");




router.post("/",createCategory);
router.post("/",getCategories);
router.post("/",updateCategory);
router.post("/:id",updateCategoryById);
router.post("/:id",deleteCategory);

module.exports= router;