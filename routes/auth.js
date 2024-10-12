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
router.post("/signup", [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('email').isEmail().withMessage('A valid email is required')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password, email } = req.body;
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [{ username }, { email }]  // Check both username and email
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or email already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Create a JWT token for the user (valid for 1 hour) with user_id
    const token = jwt.sign({ user_id: newUser.user_id, username: newUser.username }, SECRET_KEY, { expiresIn: '1h' });
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

// POST /login: Authenticate a user (with username OR email)
router.post("/login", [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').notEmpty().withMessage('Password is required'),
  check('email').isEmail().withMessage('A valid email is required')
], async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password, email } = req.body;
    const user = await User.findOne({ 
      where: { 
        [Op.or]: [{ username }, { email }]  // Allow login by either username or email
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid login credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid login credentials" });
    }

    // Create a JWT token (valid for 1 hour) with user_id
    const token = jwt.sign({ user_id: user.user_id, username: user.username, email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    return res.status(200).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
