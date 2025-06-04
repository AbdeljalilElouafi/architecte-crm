const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Payment = sequelize.define("Payment", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  method: {
    type: DataTypes.ENUM("cash", "check", "bank_transfer", "card"),
    allowNull: false,
  },
  reference: {
    type: DataTypes.STRING,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM("pending", "completed", "failed"),
    defaultValue: "completed",
  },
})

module.exports = Payment
