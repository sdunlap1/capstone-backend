"use strict";

const express = require("express");
const router = new express.Router();
const Project = require("../models/project");
const { authenticateJWT } = require("../middleware/auth");
const { check, validationResult } = require("express-validator");

const { Op } = require("sequelize");

// Create a new project
router.post(
  "/",
  authenticateJWT,
  [
    // Validation checks
    check("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ max: 255 })
      .withMessage("Name cannot be longer than 255 characters"),
    check("description")
      .optional()
      .isString()
      .withMessage("Invalid description"),
      check("start_date").optional().isString().withMessage("Invalid format"),
      check("due_date").optional().isString().withMessage("Invalid format"),
      check("completed").optional().isString().withMessage("Box must be checked"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, description, start_date, due_date, completed } = req.body;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(req.body.due_date);
      console.log(dueDate);

      const project = await Project.create({
        name,
        description: description || null,
        start_date: start_date || null,
        due_date: due_date || null,
        user_id: req.user.user_id,
        completed: completed || false,
        notified_past_due: dueDate < today,
      });

      return res.status(201).json({ project });
    } catch (err) {
      if (err.name === "SequelizeValidationError") {
        return res.status(400).json({
          errors: err.errors.map((e) => ({ message: e.message })),
        });
      }
      return next(err); // Pass unexpected errors to error handling middleware
    }
  }
);

// Get all projects for the authenticated user
router.get("/", authenticateJWT, async (req, res, next) => {
  try {
    const searchTerm = req.query.search || ""; // Get the search term

    const projects = await Project.findAll({
      where: {
        user_id: req.user.user_id,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } }, // search by name
          { description: { [Op.iLike]: `%${searchTerm}%` } }, // Search by description
        ],
      },
    });
    return res.status(200).json({ projects });
  } catch (err) {
    return next(err);
  }
});

// Update a project
router.put("/:project_id", authenticateJWT, async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.project_id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (project.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update only the fields that were provided
    if (req.body.name !== undefined) project.name = req.body.name;
    if (req.body.description !== undefined)
      project.description = req.body.description;
    if (req.body.start_date !== undefined)
      project.start_date = req.body.start_date;
    if (req.body.due_date !== undefined) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dueDate = new Date(req.body.due_date);
      if (dueDate >= today) {
        project.notified_past_due = false;
      } else if (!project.notified_past_due) {
        project.notified_past_due = true;
      }

      project.due_date = req.body.due_date;
    }
    if (req.body.completed !== undefined)
      project.completed = req.body.completed;

    await project.save();
    return res.json({ project });
  } catch (err) {
    return next(err);
  }
});

// DELETE a project
router.delete("/:project_id", authenticateJWT, async (req, res, next) => {
  try {
    const project = await Project.findByPk(req.params.project_id);

    if (!project || project.user_id !== req.user.user_id) {
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });
    }

    await project.destroy();
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
