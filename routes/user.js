"use strict";

const express = require("express");
const bcrypt = require("bcrypt");
const { authenticateJWT } = require("../middleware/auth");
const { check, validationResult } = require("express-validator");
const User = require("../models/user");

const router = new express.Router();

// GET /me: Get the current user's info
router.get("/", authenticateJWT, async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    // Find the user by user_id
    const user = await User.findByPk(userId, {
      attributes: [
        "user_id",
        "username",
        "email",
        "zip_code",
        "first_name",
        "last_name",
      ], // Only return necessary fields
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user's info back
    res.json({
      username: user.username,
      email: user.email,
      zip_code: user.zip_code,
      first_name: user.first_name,
      last_name: user.last_name,
    });
  } catch (error) {
    return next(error);
  }
});

// PUT /me: Update the current user's email and password
router.put(
  "/",
  [
    check("password")
      .optional({ nullable: true })
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    check("email")
      .optional({ nullable: true })
      .isEmail()
      .withMessage("A valid email is required"),
    check("first_name").optional({ nullable: true }).isString().trim(),
    check("last_name").optional({ nullable: true }).isString().trim(),
  ],
  authenticateJWT,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      console.log("Received request payload:", req.body);
      const userId = req.user.user_id;
      const { email, password, zip_code, first_name, last_name } = req.body;

      // Find the user by ID
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if email is already taken when the user updates thier email
      if (email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser && existingUser.user_id !== userId) {
          return res.status(400).json({ message: "Email already in use" }); // This message needs to be consistent
        }
        user.email = email;
      }

      // Update the user's password if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword; 
      }
      const bcrypt = require("bcrypt");

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }

      if (zip_code) {
        //update zip code if provided
        user.zip_code = zip_code;
      }
      if (first_name) {
        user.first_name = first_name;
      }
      if (last_name) {
        user.last_name = last_name;
      }

      await user.save(); // Save the updated user details

      return res.json({ message: "User information updated successfully." });
    } catch (error) {
      console.log("Error:", error);
      return next(error);
    }
  }
);

module.exports = router;
