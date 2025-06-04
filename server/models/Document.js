const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Document = sequelize.define("Document", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  originalName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM(
      "cin",
      "title_deed",
      "cadastral_map",
      "contract",
      "plan",
      "3d_rendering",
      "receipt",
      "invoice",
      "permit",
      "other",
    ),
    allowNull: false,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileKey: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fileSize: {
    type: DataTypes.INTEGER,
  },
  mimeType: {
    type: DataTypes.STRING,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  description: {
    type: DataTypes.TEXT,
  },
})

module.exports = Document
