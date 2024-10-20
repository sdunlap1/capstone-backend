"use strict";

const { Sequelize } = require("sequelize");
const { getDatabaseUri } = require("./config");

// Initialize Sequelize with timezone settings and without custom logging
const sequelize = new Sequelize(getDatabaseUri(), {
  dialect: "postgres",  // We’re using PostgreSQL
  logging: false,  // Disable logging
  timezone: '+00:00',  // Force Sequelize to use UTC for storing dates
  dialectOptions: {
    useUTC: true,  // Make sure Sequelize reads from the database in UTC
  },
});

module.exports = sequelize;
