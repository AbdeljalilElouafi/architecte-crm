const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Client = sequelize.define("Client", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Client type : individual or corporate
  clientType: {
    type: DataTypes.ENUM("individual", "corporate"),
    allowNull: false,
    defaultValue: "individual",
  },

  // Individual client fields
  firstName: {
    type: DataTypes.STRING,
    allowNull: true, // Now optional since corporate clients won't have this
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true, // Now optional since corporate clients won't have this
  },
  cin: {
    type: DataTypes.STRING,
    allowNull: true, // Only for individual clients
    unique: "cin_unique",
  },

  // Corporate client fields
  companyName: {
    type: DataTypes.STRING,
    allowNull: true, // Required for corporate clients
  },
  rc: {
    type: DataTypes.STRING,
    allowNull: true, // Registre de Commerce
    unique: "rc_unique",
  },
  ice: {
    type: DataTypes.STRING,
    allowNull: true, // Identifiant Commun de l'Entreprise
    unique: "ice_unique",
  },
  headquarters: {
    type: DataTypes.TEXT,
    allowNull: true, // Siège social
  },

  // Common fields
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
  notes: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM("active", "inactive", "archived"),
    defaultValue: "active",
  },
})

module.exports = Client
