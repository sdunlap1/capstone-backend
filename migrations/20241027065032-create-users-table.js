'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      user_id: { 
        type: Sequelize.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
      },
      username: { 
        type: Sequelize.STRING, 
        allowNull: false, 
        unique: true 
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      password: { 
        type: Sequelize.STRING, 
        allowNull: false 
      },
      zip_code: { 
        type: Sequelize.STRING,
        allowNull: true, // Optional to support existing users without zip
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'), // Automatically adds creation date
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW'), // Automatically updates timestamp
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
