"use strict";

const app = require("./app");
const { PORT } = require("./config/config");
const sequelize = require("./config/sequelize");  // Sequelize connection

// Sync the database and start the server
sequelize.sync({ alter: true })
  .then(() => {
    console.log("Database connected!");

    app.listen(PORT, '10.0.4.23', function () {
      console.log(`Server started on http://10.0.4.23:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Database connection failed:", err);
  });
