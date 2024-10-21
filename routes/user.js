"use strict";

const express = require("express");
const bcrypt = require("bcrypt");
const { authenticateJWT } = require("../middleware/auth");
const User = require("../models/user");

const router = new express.Router();

// GET /me: Get the current user's info
router.get("/", authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    // Find the user by user_id
    const user = await User.findByPk(userId, {
      attributes: ["user_id", "username", "email"], // Only return necessary fields
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

// PUT /me: Update the current user's email and password
router.put("/", authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { email, password } = req.body;

    // Find the user by ID
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the user's email if provided
    if (email) {
      user.email = email;
    }

    // Update the user's password if provided
    if (password) {
      user.password = password; // Make sure to hash the password before saving!
    }
    const bcrypt = require("bcrypt");

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save(); // Save the updated user details

    return res.json({ message: "User information updated successfully." });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
