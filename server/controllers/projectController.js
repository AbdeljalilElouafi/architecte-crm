const { Project, Client, Document, Payment } = require("../models")
const { Op, sequelize } = require("sequelize")

const getAllProjects = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, clientId } = req.query
    const offset = (page - 1) * limit

    const whereClause = {}
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } },
      ]
    }
    if (status) {
      whereClause.status = status
    }
    if (clientId) {
      whereClause.clientId = clientId
    }

    const { count, rows } = await Project.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: Document,
          as: "documents",
          attributes: ["id", "name", "type", "price"],
        },
        {
          model: Payment,
          as: "payments",
          attributes: ["id", "amount", "paymentDate", "status"],
        },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["createdAt", "DESC"]],
    })

    // Calculate financial summary for each project
    const projectsWithSummary = rows.map((project) => {
      const totalPaid = project.payments
        .filter((payment) => payment.status === "completed")
        .reduce((sum, payment) => sum + Number.parseFloat(payment.amount), 0)

      const remainingBalance = Number.parseFloat(project.totalPrice) - totalPaid

      return {
        ...project.toJSON(),
        financialSummary: {
          totalPrice: Number.parseFloat(project.totalPrice),
          totalPaid,
          remainingBalance,
          paymentProgress: project.totalPrice > 0 ? (totalPaid / project.totalPrice) * 100 : 0,
        },
      }
    })

    res.json({
      projects: projectsWithSummary,
      totalPages: Math.ceil(count / limit),
      currentPage: Number.parseInt(page),
      totalProjects: count,
    })
  } catch (error) {
    console.error("Get projects error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params
    const project = await Project.findByPk(id, {
      include: [
        {
          model: Client,
          as: "client",
        },
        {
          model: Document,
          as: "documents",
          order: [["createdAt", "DESC"]],
        },
        {
          model: Payment,
          as: "payments",
          order: [["paymentDate", "DESC"]],
        },
      ],
    })

    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    // Calculate financial summary
    const totalPaid = project.payments
      .filter((payment) => payment.status === "completed")
      .reduce((sum, payment) => sum + Number.parseFloat(payment.amount), 0)

    const remainingBalance = Number.parseFloat(project.totalPrice) - totalPaid

    const projectWithSummary = {
      ...project.toJSON(),
      financialSummary: {
        totalPrice: Number.parseFloat(project.totalPrice),
        totalPaid,
        remainingBalance,
        paymentProgress: project.totalPrice > 0 ? (totalPaid / project.totalPrice) * 100 : 0,
      },
    }

    res.json(projectWithSummary)
  } catch (error) {
    console.error("Get project error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body)
    const projectWithClient = await Project.findByPk(project.id, {
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    })
    res.status(201).json(projectWithClient)
  } catch (error) {
    console.error("Create project error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const updateProject = async (req, res) => {
  try {
    const { id } = req.params
    const [updatedRowsCount] = await Project.update(req.body, {
      where: { id },
    })

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: "Project not found" })
    }

    const updatedProject = await Project.findByPk(id, {
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    })
    res.json(updatedProject)
  } catch (error) {
    console.error("Update project error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params
    const deletedRowsCount = await Project.destroy({
      where: { id },
    })

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: "Project not found" })
    }

    res.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Delete project error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const getProjectStats = async (req, res) => {
  try {
    const stats = await Project.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "totalValue"],
      ],
      group: ["status"],
    })

    const formattedStats = stats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: Number.parseInt(stat.dataValues.count),
        totalValue: Number.parseFloat(stat.dataValues.totalValue) || 0,
      }
      return acc
    }, {})

    res.json(formattedStats)
  } catch (error) {
    console.error("Get project stats error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
}
