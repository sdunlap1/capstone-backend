"use strict"

const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zip_code: {
      // Add the zip_code field
      type: DataTypes.STRING,
      allowNull: true, // Optional for existing users
    },
  },
  {
    tableName: "users", // Keep this to prevent Sequelize from creating "Users"
    timestamps: true,
  }
);

// Add hooks separately, outside the define call
User.beforeCreate((user) => {
  user.email = user.email.toLowerCase();
});

User.beforeUpdate((user) => {
  if (user.email) user.email = user.email.toLowerCase();
});

module.exports = User;
