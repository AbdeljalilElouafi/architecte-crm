const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Project = sequelize.define("Project", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM("new_build", "renovation", "extension", "interior_design", "consultation"),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM("planning", "in_progress", "review", "completed", "on_hold", "cancelled"),
    defaultValue: "planning",
  },
  startDate: {
    type: DataTypes.DATE,
  },
  endDate: {
    type: DataTypes.DATE,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  location: {
    type: DataTypes.STRING,
  },
  priority: {
    type: DataTypes.ENUM("low", "medium", "high", "urgent"),
    defaultValue: "medium",
  },
})

module.exports = Project
