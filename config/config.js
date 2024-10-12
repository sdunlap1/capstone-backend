"use strict";

require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "secret-dev";
const PORT = +process.env.PORT || 3001;

// Determine which database to use (development, test, or production)
function getDatabaseUri() {
  const dbName = process.env.NODE_ENV === "test" ? "taskmanager_test" : process.env.DB_NAME;
  return `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${dbName}`;
}

// Bcrypt work factor (adjust for test vs production)
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

console.log("Task Manager Config:");
console.log("SECRET_KEY:", SECRET_KEY);
console.log("PORT:", PORT.toString());
console.log("BCRYPT_WORK_FACTOR:", BCRYPT_WORK_FACTOR);
console.log("Database URI:", getDatabaseUri());
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
};
