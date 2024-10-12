const sequelize = require('../config/sequelize');
const User = require('./user');
const Task = require('./task');
const Category = require('./category');
const Project = require('./project');

// Define associations
User.hasMany(Task, { foreignKey: 'user_id' });  // A User has many Tasks
Task.belongsTo(User, { foreignKey: 'user_id' });  // A Task belongs to a User

User.hasMany(Project, { foreignKey: "user_id" });  // A User has many Projects
Project.belongsTo(User, { foreignKey: "user_id" });  // A Project belongs to a User

Project.hasMany(Task, { foreignKey: "project_id" });  // A Project has many Tasks
Task.belongsTo(Project, { foreignKey: "project_id" });  // A Task belongs to a Project

Category.hasMany(Task, { foreignKey: 'category_id' });  // A Category has many Tasks
Task.belongsTo(Category, { foreignKey: 'category_id' });  // A Task belongs to a Category

// Export the initialized models and sequelize instance
module.exports = {
  sequelize,
  User,
  Task,
  Category,
  Project,  // Make sure to export Project as well
};
