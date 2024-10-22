"use strict";

const express = require("express");
const router = new express.Router();
const Project = require("../models/project");
const { authenticateJWT } = require("../middleware/auth");

// Create a new project
router.post("/", authenticateJWT, async (req, res, next) => {
  try {
    const project = await Project.create({
      name: req.body.name,
      description: req.body.description,
      start_date: req.body.start_date,  // Include start_date
      due_date: req.body.due_date,  // Include due_date for multi-day projects
      user_id: req.user.user_id,
      completed: req.body.completed || false,
    });

    return res.status(201).json({ project });
  } catch (err) {
    if (err.name === "SequelizeValidationError") {
      return res.status(400).json({
        errors: err.errors.map(e => ({ message: e.message }))
      });
    }
    return next(err);  // Pass unexpected errors to error handling middleware
  }
});
const { Op } = require("sequelize");

// Get all projects for the authenticated user
router.get("/", authenticateJWT, async (req, res, next) => {
  try {
    const searchTerm = req.query.search || ""; // Get the search term

    const projects = await Project.findAll({
      where: { user_id: req.user.user_id,
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } }, // search by name
          { description: { [Op.iLike]: `%${searchTerm}%` } }, // Search by description
        ]
       }
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
    if (req.body.description !== undefined) project.description = req.body.description;
    if (req.body.start_date !== undefined) project.start_date = req.body.start_date;
    if (req.body.due_date !== undefined) project.due_date = req.body.due_date;
    if (req.body.completed !== undefined) project.completed = req.body.completed;
    
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
      return res.status(404).json({ message: "Project not found or unauthorized" });
    }

    await project.destroy();
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
