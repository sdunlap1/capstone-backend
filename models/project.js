"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Project = sequelize.define(
  "Project",
  {
    project_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Project name is required.",
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    start_date: {
      type: DataTypes.DATE, // Added start_date for multi-day projects
      allowNull: true, // Allow it to be null if not provided
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completed: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Active",
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users", // Refers to the 'users' table
        key: "user_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
  },
  {
    tableName: "projects", // Explicit table name
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);

module.exports = Project;
