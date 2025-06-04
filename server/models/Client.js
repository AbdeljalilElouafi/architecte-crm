const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Client = sequelize.define("Client", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
  cin: {
    type: DataTypes.STRING,
    unique: true,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive", "archived"),
    defaultValue: "active",
  },
})

module.exports = Client
