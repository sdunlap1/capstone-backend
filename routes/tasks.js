"use strict";

const express = require("express");
const Task = require("../models/task");
const { authenticateJWT } = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const router = new express.Router();
const { Op } = require("sequelize");

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
    check("due_date").optional().isISO8601().withMessage("Invalid format"),
    check("completed")
      .optional()
      .isBoolean()
      .withMessage("Box must be checked"),
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
      const { title, due_date, completed, category_id, description } = req.body;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(req.body.due_date);

      // Create the new task
      const task = await Task.create({
        title,
        due_date: due_date || null, // Ensure null for optional date
        completed: completed || false, // Default to false if not provided
        user_id: req.user.user_id, // Access user_id from JWT
        category_id: category_id || null, // Default to null if not provided
        description: description || null, // Add description to the task creation
        notified_past_due: dueDate < today,
      });

      return res.status(201).json({ task });
    } catch (err) {
      console.error("Error creating task:", err); // Log the actual error
      return res
        .status(500)
        .json({ error: "Something went wrong!", details: err.message });
    }
  }
);

// GET /tasks: Fetch paginated tasks for the authenticated user
router.get("/", authenticateJWT, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const searchTerm = req.query.search || ""; // Get the search term

    // Check if category_id is provided in the query parameters
    const category_id = req.query.category_id;

    const whereClause = {
      user_id: req.user.user_id,
      [Op.or]: [
        { title: { [Op.iLike]: `%${searchTerm}%` } }, // Search by title
        { description: { [Op.iLike]: `%${searchTerm}%` } }, //Search by description
      ],
    };
    if (category_id) {
      whereClause.category_id = category_id; // Filter by category
    }

    // Fetch tasks with pagination and optional category filter
    const tasks = await Task.findAndCountAll({
      where: whereClause,
      attributes: [
        "task_id",
        "title",
        "completed",
        "description",
        "category_id",
        "notified_past_due",
        [
          // Format due_date to ISO toString
          Task.sequelize.fn(
            "TO_CHAR",
            Task.sequelize.col("due_date"),
            'YYYY-MM-DD"T"HH24:MI:SS'
          ),
          "due_date",
        ],
      ],
      raw: true,
      logging: console.log,
      limit,
      offset,
    });

    console.log("Tasks being returned from the database:", tasks.rows);

    // console.log("Tasks being returned:", tasks.rows);
    return res.json({
      tasks: tasks.rows,
      totalPages: Math.ceil(tasks.count / limit),
      currentPage: page,
    });
  } catch (err) {
    return next(err);
  }
});

// PUT /tasks/:task_id: Update a task
router.put("/:task_id", authenticateJWT, async (req, res, next) => {
  try {
    const { title, due_date, completed, category_id, description } = req.body;
    const task = await Task.findByPk(req.params.task_id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" }); // Not found
    }
    // Log the completed value from the request body
    console.log("Received completed value:", completed);
    console.log("Full request body:", req.body);

    // Update task fields
    await task.update(req.body);

    if (task.user_id !== req.user.user_id) {
      // Ensure the user can only update their own tasks
      return res.status(403).json({ message: "Unauthorized" }); // Forbidden
    }

    console.log("=== Incoming Request Body ===");
    console.log(req.body);

    // Update fields
    const updatedFields = {};

    if (title !== undefined) updatedFields.title = title;
    if (category_id !== undefined) updatedFields.category_id = category_id;
    if (description !== undefined) updatedFields.description = description;

    if (due_date !== undefined) {
      console.log("Received due_date:", due_date);
      const dueDate = new Date(due_date);
      console.log("Parsed due_date:", dueDate);
      if (isNaN(dueDate.getTime())) {
        console.error("Invalid due_date format:", due_date);
        return res.status(400).json({ message: "Invalid date format" }); // Bad Request if date is invalid
      }

      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      console.log("Today (midnight):", today);

      if (dueDate >= today) {
        task.notified_past_due = false;
      } else if (!task.notified_past_due) {
        task.notified_past_due = true;
      }

      task.due_date = dueDate;
    }

    if (completed !== undefined) {
      if (typeof completed !== "boolean") {
        console.error("Invalid completed value:", completed);
        return res.status(400).json({ message: "Invalid value for completed" }); // Bad Request if completed is not a boolean
      }
      task.completed = completed;
    }
    console.log("Updated Fields:", updatedFields);
    // Use task.update() to update only the provided fields
    await task.update(updatedFields);
    console.log("Task after update:", task);
    return res.status(200).json({ task }); // Success with explicit 200 status code
  } catch (err) {
    console.error("Error in PUT /tasks:", err);
    return next(err);
  }
});

// DELETE /tasks/:task_id: Delete a task
router.delete("/:task_id", authenticateJWT, async (req, res, next) => {
  try {
    const task = await Task.findByPk(req.params.task_id);

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
