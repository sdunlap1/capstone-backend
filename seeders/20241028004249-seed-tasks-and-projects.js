"use strict";

const { Task, Project, User } = require('../models'); // Adjusted to load from index.js
const sequelize = require('../config/sequelize');
// Log to confirm models are loaded correctly
console.log("Task model:", Task);
console.log("Project model:", Project);
console.log("Seeding database with DB_PORT:", process.env.DB_PORT);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up () {
    const userId = 1; // Replace with the actual ID of 'testuser'
    // Seed 10 tasks
  const tasks = [
    { title: 'Finish report', due_date: '2024-10-22', user_id: userId, completed: false, description: "Complete the annual report." },
    { title: 'Plan marketing strategy', due_date: '2024-10-25', user_id: userId, completed: false, description: "Outline the Q4 marketing strategy." },
    { title: 'Client meeting', due_date: '2024-10-27', user_id: userId, completed: false, description: "Meet with the client to discuss project details." },
    { title: 'Update website', due_date: '2024-11-01', user_id: userId, completed: false, description: "Redesign the landing page." },
    { title: 'Review budget', due_date: '2024-11-02', user_id: userId, completed: false, description: "Check the department budget for overspending." },
    { title: 'Prepare presentation', due_date: '2024-11-05', user_id: userId, completed: false, description: "Prepare a presentation for the next staff meeting." },
    { title: 'Write blog post', due_date: '2024-11-10', user_id: userId, completed: false, description: "Write the monthly blog post." },
    { title: 'Check analytics', due_date: '2024-11-12', user_id: userId, completed: false, description: "Check the website's analytics performance." },
    { title: 'Research competitors', due_date: '2024-11-15', user_id: userId, completed: false, description: "Analyze the competition." },
    { title: 'Team meeting', due_date: '2024-11-20', user_id: userId, completed: false, description: "Weekly team sync-up meeting." }
  ];

  // Seed 10 projects
  const projects = [
    { name: 'Website Redesign', start_date: '2024-10-01', due_date: '2024-10-31', user_id: userId, description: "Complete the website redesign project." },
    { name: 'Q4 Marketing Plan', start_date: '2024-10-10', due_date: '2024-10-25', user_id: userId, description: "Develop and finalize the Q4 marketing strategy." },
    { name: 'Product Launch', start_date: '2024-10-15', due_date: '2024-11-10', user_id: userId, description: "Prepare for the upcoming product launch." },
    { name: 'Budget Review', start_date: '2024-10-20', due_date: '2024-11-05', user_id: userId, description: "Review the budget for the upcoming fiscal year." },
    { name: 'New Feature Development', start_date: '2024-10-25', due_date: '2024-11-20', user_id: userId, description: "Develop new features for the product." },
    { name: 'Customer Survey', start_date: '2024-11-01', due_date: '2024-11-15', user_id: userId, description: "Conduct a survey to gather customer feedback." },
    { name: 'Staff Training Program', start_date: '2024-11-05', due_date: '2024-11-30', user_id: userId, description: "Organize a staff training program." },
    { name: 'System Upgrade', start_date: '2024-11-10', due_date: '2024-11-25', user_id: userId, description: "Upgrade the system to the latest version." },
    { name: 'Year-End Review', start_date: '2024-11-15', due_date: '2024-12-10', user_id: userId, description: "Conduct a year-end review of all operations." },
    { name: 'Holiday Campaign', start_date: '2024-11-20', due_date: '2024-12-05', user_id: userId, description: "Plan the holiday marketing campaign." }
  ];
  // Insert tasks and projects into the database
  await Task.bulkCreate(tasks);
  await Project.bulkCreate(projects);
  },

  async down (queryInterface, Sequelize) {
    // Optionally, clear the tasks and projects if you roll back this seeder
    await queryInterface.bulkDelete("tasks", null, {});
    await queryInterface.bulkDelete("projects", null, {});
  }
};
