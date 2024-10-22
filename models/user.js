const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const User = sequelize.define('User', {
  user_id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  username: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  }
}, {
  tableName: 'users',  // Keep this to prevent Sequelize from creating "Users"
  timestamps: true
});

  // Add hooks separately, outside the define call
User.beforeCreate((user) => {
  user.username = user.username.toLowerCase();
  user.email = user.email.toLowerCase();
});

User.beforeUpdate((user) => {
  if (user.username) user.username = user.username.toLowerCase();
  if (user.email) user.email = user.email.toLowerCase();
});

module.exports = User;
