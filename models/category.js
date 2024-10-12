"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const Category = sequelize.define("Category", {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,  // Each category name should be unique
  },
}, {
  tableName: "categories",  // Explicitly set table name
  timestamps: true, // Keeping track of createdAt and updatedAt
});

module.exports = Category;
