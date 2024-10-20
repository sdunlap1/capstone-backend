"use strict"

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");
const Category = require("./category");

const Task = sequelize.define("Task", {
  title: { type: DataTypes.STRING, allowNull: false },
  due_date: { type: DataTypes.DATE, allowNull: true },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: "users", key: "user_id" },
  },
  category_id: { 
    type: DataTypes.INTEGER,
    references: { model: "categories", key: "category_id"},
    allowNull: true, // A task doesn't have to have a category
  }
}, {
  tableName: 'tasks',  // Keep this to prevent Sequelize from creating "Tasks"
  timestamps: true
});

// Define relationships for sequelize to use
Task.belongsTo(Category, { foreignKey: "category_id" });
Category.hasMany(Task, { foreignKey: "category_id" });

module.exports = Task;
