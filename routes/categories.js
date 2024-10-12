"use strict";

const express = require("express");
const Category = require("../models/category");
const { authenticateJWT } = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const router = new express.Router();

// GET /categories: Get all categories
router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    return res.json({ categories });
  } catch (err) {
    return next(err);
  }
});

// POST /categories: Create a new category
router.post(
  "/",
  authenticateJWT,
  [
    // Validation checks
    check("name").notEmpty().withMessage("Category name is required")
      .isLength({ max: 255 }).withMessage("Category name cannot be longer than 255 characters")
  ],
  async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name } = req.body;

      // Create the new category
      const category = await Category.create({ name });

      return res.status(201).json({ category });
    } catch (err) {
      console.error("Error creating category:", err);  // Log the actual error
      return res.status(500).json({ error: "Something went wrong!", details: err.message });
    }
  }
);

// DELETE /categories/:id: Delete a category
router.delete("/:id", authenticateJWT, async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    await category.destroy();
    return res.status(200).json({ message: `Category '${category.name}' deleted successfully`});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
