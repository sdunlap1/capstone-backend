"use strict";

const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const categoryRoutes = require("./routes/categories");
const projectRoutes = require("./routes/projects");

const app = express();

// Middlewares
app.use(express.json()); // To parse JSON request bodies

// CORS options
const corsOptions = {
  origin: '*', // Adjust this to your frontend domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions)); // Enable CORS with the defined options

// Test Route
app.get("/", (req, res) => {
  res.send("Task Manager API is up and running!");
});

// Auth Routes for signup and login
app.use("/auth", authRoutes);

// Task Management Routes (Protected by JWT)
app.use("/tasks", taskRoutes);

// Categories routes
app.use("/categories", categoryRoutes);

// User-related routes
app.use("/user", userRoutes);

// Project-related routes
app.use("/projects", projectRoutes);

// Error handling (optional but useful for debugging)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: "Something went wrong!" });
});

module.exports = app;
