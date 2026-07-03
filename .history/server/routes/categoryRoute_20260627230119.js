const express = require("express");
const router = express.router();


const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
}= require("../controllers/categoryController");



