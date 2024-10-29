"use strict";

const app = require("./app");
const { PORT } = require("./config/config");
const sequelize = require("./config/sequelize");  // Sequelize connection

// Use localhost on Render and 10.0.4.23 for local development
const HOST = process.env.NODE_ENV === "production" ? '0.0.0.0' : '10.0.4.23';

// Sync the database and start the server
sequelize.authenticate()
  .then(() => {
    console.log("Database connected!");
    
    app.listen(PORT, HOST, function () {
      console.log(`Server started on http://${HOST}:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Database connection failed:", err);
  });
