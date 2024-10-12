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
      due_date: req.body.due_date,
      user_id: req.user.user_id
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

// Get all projects for the authenticated user
router.get("/", authenticateJWT, async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      where: { user_id: req.user.user_id }
    });
    
    return res.status(200).json({ projects });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
