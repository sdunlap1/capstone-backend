"use strict";

const express = require("express");
const { authenticateJWT } = require("../middleware/auth");
const User = require("../models/user");

const router = new express.Router();

// GET /me: Get the current user's info
router.get("/me", authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    // Find the user by user_id
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'username', 'email'] // Only return necessary fields
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user's info back
    res.json({
      username: user.username,
      email: user.email,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
