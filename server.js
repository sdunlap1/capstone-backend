"use strict";

const app = require("./app");
const { PORT } = require("./config/config");
const sequelize = require("./config/sequelize");  // Sequelize connection

// Bind the server to 0.0.0.0
const HOST = '0.0.0.0';

// Sync the database and start the server
sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database connected!");

    const HOST = process.env.HOST || 'localhost'; // Use HOST from environment or default to localhost
    const PORT = process.env.PORT || 3001;
    
    app.listen(HOST, PORT, function () {
      console.log(`Server started on http://${HOST}:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Database connection failed:", err);
  });
