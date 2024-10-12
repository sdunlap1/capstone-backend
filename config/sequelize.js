"use strict";

const { Sequelize } = require("sequelize");
const { getDatabaseUri } = require("./config");

// Initialize Sequelize without custom logging
const sequelize = new Sequelize(getDatabaseUri(), {
  dialect: "postgres",  // We’re using PostgreSQL
  logging: false,  // Disable logging
});

module.exports = sequelize;
