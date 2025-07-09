const { Client, Project, Document } = require("../models")
const { Op } = require("sequelize")

const getAllClients = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, clientType } = req.query
    const offset = (page - 1) * limit

    const whereClause = {}

    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { companyName: { [Op.like]: `%${search}%` } },
        { managerName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { rc: { [Op.like]: `%${search}%` } },
        { ice: { [Op.like]: `%${search}%` } },
      ]
    }

    if (status) {
      whereClause.status = status
    }

    if (clientType) {
      whereClause.clientType = clientType
    }

    const { count, rows } = await Client.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: "projects",
          attributes: ["id", "title", "status", "totalPrice"],
        },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["createdAt", "DESC"]],
    })

    res.json({
      clients: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: Number.parseInt(page),
      totalClients: count,
    })
  } catch (error) {
    console.error("Get clients error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const getClientById = async (req, res) => {
  try {
    const { id } = req.params

    const client = await Client.findByPk(id, {
      include: [
        {
          model: Project,
          as: "projects",
          include: [{ model: Document, as: "documents" }],
        },
        {
          model: Document,
          as: "documents",
        },
      ],
    })

    if (!client) {
      return res.status(404).json({ message: "Client not found" })
    }

    res.json(client)
  } catch (error) {
    console.error("Get client error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const createClient = async (req, res) => {
  try {
    // Validate required fields based on client type
    const { clientType } = req.body

    if (clientType === "individual") {
      // For individual clients, we need personal info
      if (!req.body.firstName || !req.body.lastName || !req.body.cin) {
        return res.status(400).json({
          message: "Pour un client individuel, le prénom, nom et CIN sont requis",
        })
      }
    } else if (clientType === "corporate") {
      // For corporate clients, we need company info AND manager info
      if (!req.body.companyName || !req.body.rc || !req.body.ice) {
        return res.status(400).json({
          message: "Pour un client entreprise, la raison sociale, RC et ICE sont requis",
        })
      }
      if (!req.body.managerName || !req.body.managerCIN) {
        return res.status(400).json({
          message: "Pour un client entreprise, le nom et CIN du gérant sont requis",
        })
      }
    }

    const client = await Client.create(req.body)
    res.status(201).json(client)
  } catch (error) {
    console.error("Create client error:", error)
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Un client avec ces informations existe déjà (CIN, RC, ICE ou CIN du gérant)",
      })
    }
    res.status(500).json({ message: "Internal server error" })
  }
}

const updateClient = async (req, res) => {
  try {
    const { id } = req.params

    // Validate required fields based on client type
    const { clientType } = req.body

    if (clientType === "individual") {
      // For individual clients, we need personal info
      if (!req.body.firstName || !req.body.lastName || !req.body.cin) {
        return res.status(400).json({
          message: "Pour un client individuel, le prénom, nom et CIN sont requis",
        })
      }
    } else if (clientType === "corporate") {
      // For corporate clients, we need company info AND manager info
      if (!req.body.companyName || !req.body.rc || !req.body.ice) {
        return res.status(400).json({
          message: "Pour un client entreprise, la raison sociale, RC et ICE sont requis",
        })
      }
      if (!req.body.managerName || !req.body.managerCIN) {
        return res.status(400).json({
          message: "Pour un client entreprise, le nom et CIN du gérant sont requis",
        })
      }
    }

    const [updatedRowsCount] = await Client.update(req.body, {
      where: { id },
    })

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: "Client not found" })
    }

    const updatedClient = await Client.findByPk(id)
    res.json(updatedClient)
  } catch (error) {
    console.error("Update client error:", error)
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        message: "Un client avec ces informations existe déjà (CIN, RC, ICE ou CIN du gérant)",
      })
    }
    res.status(500).json({ message: "Internal server error" })
  }
}

const deleteClient = async (req, res) => {
  try {
    const { id } = req.params

    const deletedRowsCount = await Client.destroy({
      where: { id },
    })

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: "Client not found" })
    }

    res.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Delete client error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
}
