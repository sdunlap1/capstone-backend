"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });

// Define associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Define associations
db.User.hasMany(db.Task, { foreignKey: "user_id" }); // A User has many Tasks
db.Task.belongsTo(db.User, { foreignKey: "user_id" }); // A Task belongs to a User

db.User.hasMany(db.Project, { foreignKey: "user_id" }); // A User has many Projects
db.Project.belongsTo(db.User, { foreignKey: "user_id" }); // A Project belongs to a User

// Project.hasMany(Task, { foreignKey: "project_id" });  // A Project has many Tasks
// Task.belongsTo(Project, { foreignKey: "project_id" });  // A Task belongs to a Project

db.Category.hasMany(db.Task, { foreignKey: "category_id" }); // A Category has many Tasks
db.Task.belongsTo(db.Category, { foreignKey: "category_id" }); // A Task belongs to a Category

// Export the initialized models and sequelize instance
db.sequelize = sequelize;
db.Sequelize = require("sequelize");

module.exports = db;
