const sequelize = require("../config/database")
const User = require("./User")
const Client = require("./Client")
const Project = require("./Project")
const Document = require("./Document")
const Payment = require("./Payment")

// Define associations
Client.hasMany(Project, { foreignKey: "clientId", as: "projects" })
Project.belongsTo(Client, { foreignKey: "clientId", as: "client" })

Project.hasMany(Document, { foreignKey: "projectId", as: "documents" })
Document.belongsTo(Project, { foreignKey: "projectId", as: "project" })

Client.hasMany(Document, { foreignKey: "clientId", as: "documents" })
Document.belongsTo(Client, { foreignKey: "clientId", as: "client" })

Project.hasMany(Payment, { foreignKey: "projectId", as: "payments" })
Payment.belongsTo(Project, { foreignKey: "projectId", as: "project" })

module.exports = {
  sequelize,
  User,
  Client,
  Project,
  Document,
  Payment,
}
