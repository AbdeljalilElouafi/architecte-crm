const { DataTypes } = require("sequelize")
const sequelize = require("../config/database")

const Client = sequelize.define("Client", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // Client type - individual or corporate
  clientType: {
    type: DataTypes.ENUM("individual", "corporate"),
    allowNull: false,
    defaultValue: "individual",
  },

  // Individual client fields (can also have company info)
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cin: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: "cin_unique",
  },

  // Company fields (for both individual with business and corporate)
  companyName: {
    type: DataTypes.STRING,
    allowNull: true,
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

  // Manager/Responsible person fields (for individual clients with companies)
  managerName: {
    type: DataTypes.STRING,
    allowNull: true, // Nom du gérant
  },
  managerCIN: {
    type: DataTypes.STRING,
    allowNull: true, // CIN du gérant
    unique: "manager_cin_unique",
  },
  managerPhone: {
    type: DataTypes.STRING,
    allowNull: true, // Téléphone du gérant
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
