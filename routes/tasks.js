"use strict";

const express = require("express");
const Task = require("../models/task");
const { authenticateJWT } = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const router = new express.Router();

// GET /tasks: Fetch paginated tasks for the authenticated user
router.get("/", authenticateJWT, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if category_id is provided in the query parameters
    const category_id = req.query.category_id;

    const whereClause = { user_id: req.user.user_id }; // Always filter by user_id
    if (category_id) {
      whereClause.category_id = category_id; // Optional: Add category filter if provided
    }

    // Fetch tasks with pagination and optional category filter
    const tasks = await Task.findAndCountAll({
      where: whereClause,
      limit,
      offset,
    });

    return res.json({
      tasks: tasks.rows,
      totalPages: Math.ceil(tasks.count / limit),
      currentPage: page,
    });
  } catch (err) {
    return next(err);
  }
});

// POST /tasks: Create a new task
router.post(
  "/",
  authenticateJWT,
  [
    // Validation checks
    check("title")
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ max: 255 })
      .withMessage("Title cannot be longer than 255 characters"),
    check("due_date").optional().isISO8601().withMessage("Invalid date format"),
    check("completed")
      .optional()
      .isBoolean()
      .withMessage("Completed must be a boolean"),
    check("category_id")
      .optional()
      .isInt()
      .withMessage("Category ID must be a number"),
  ],
  async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, due_date, completed, category_id } = req.body;

      // Create the new task
      const task = await Task.create({
        title,
        due_date: due_date || null, // Ensure null for optional date
        completed: completed || false, // Default to false if not provided
        user_id: req.user.user_id, // Access user_id from JWT
        category_id: category_id || null, // Default to null if not provided
      });

      return res.status(201).json({ task });
    } catch (err) {
      console.error("Error creating task:", err);  // Log the actual error
      return res.status(500).json({ error: "Something went wrong!", details: err.message });
    }
  }
);

// PUT /tasks/:id: Update a task
router.put("/:id", authenticateJWT, async (req, res, next) => {
  try {
    const { title, due_date, completed, category_id } = req.body;
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" }); // Not found
    }
    if (task.user_id !== req.user.user_id) {
      // Use user_id
      return res.status(403).json({ message: "Unauthorized" }); // Forbidden
    }

    task.title = title;
    task.due_date = due_date;
    task.completed = completed;
    task.category_id = category_id;
    await task.save();

    return res.json({ task });
  } catch (err) {
    return next(err);
  }
});

// DELETE /tasks/:id: Delete a task
router.delete("/:id", authenticateJWT, async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task || task.user_id !== req.user.user_id) {
      // Use user_id
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    await task.destroy();
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;