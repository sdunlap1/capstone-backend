"use strict";

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config/config");
const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const { Op } = require("sequelize");

const router = new express.Router();

// POST /signup: Register a new user
router.post(
  "/signup",
  [
    check("username").notEmpty().withMessage("Username is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    check("email").isEmail().withMessage("A valid email is required"),
    check("first_name").optional().isString().trim(),
    check("last_name").optional().isString().trim(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password, email, first_name, last_name } = req.body;

      // Normalize username and email by converting them to lowercase and trimming whitespace
      const normalizedUsername = username.trim().toLowerCase();
      const normalizedEmail = email.trim().toLowerCase();

      // Check if the username or email is already taken (case-insensitive)
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { username: { [Op.iLike]: normalizedUsername } }, // Case-insensitive check for username
            { email: { [Op.iLike]: normalizedEmail } }, // Case-insensitive check for email
          ],
        },
      });

      // Check if the username or email is already taken
      if (existingUser) {
        if (existingUser.username.toLowerCase() === normalizedUsername) {
          return res.status(400).json({ message: "Username already taken" });
        }
        if (existingUser.email.toLowerCase() === normalizedEmail) {
          return res.status(400).json({ message: "Email already in use" });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      // Create a new case-sensitive username and lowercase mail.
      const newUser = await User.create({
        username: username.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        first_name: first_name,
        last_name: last_name,
      });

      // Create a JWT token for the user (valid for 1 hour) with user_id
      const token = jwt.sign(
        {
          user_id: newUser.user_id,
          username: newUser.username,
          first_name: newUser.first_name, // Optional: Include first name
          last_name: newUser.last_name, // Optional: Include last name
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      return res.status(201).json({ token });
    } catch (err) {
      return next(err);
    }
  }
);

// POST /login: Authenticate a user (with username OR email)
router.post(
  "/login",
  [
    // Custom validation:
    check("username").optional().notEmpty().withMessage("Username is required"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, password } = req.body;

      // Search by case-sensitive username
      const user = await User.findOne({
        where: { username },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid login credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return restatus(400).json({ message: "Invalid login credentials "});
      }

      // Create a JWT token (valid for 1 hour) with user_id
      const token = jwt.sign(
        {
          user_id: user.user_id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      return res.status(200).json({ token });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
