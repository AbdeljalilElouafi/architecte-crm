const { Payment, Project, Client, sequelize } = require("../models")
const { Op } = require("sequelize")

const getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, projectId, status, method, startDate, endDate } = req.query
    const offset = (page - 1) * limit

    const whereClause = {}

    if (projectId) whereClause.projectId = projectId
    if (status) whereClause.status = status
    if (method) whereClause.method = method

    if (startDate && endDate) {
      whereClause.paymentDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    } else if (startDate) {
      whereClause.paymentDate = {
        [Op.gte]: new Date(startDate),
      }
    } else if (endDate) {
      whereClause.paymentDate = {
        [Op.lte]: new Date(endDate),
      }
    }

    const { count, rows } = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "title", "totalPrice"],
          include: [
            {
              model: Client,
              as: "client",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["paymentDate", "DESC"]],
    })

    res.json({
      payments: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: Number.parseInt(page),
      totalPayments: count,
    })
  } catch (error) {
    console.error("Get payments error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params

    const payment = await Payment.findByPk(id, {
      include: [
        {
          model: Project,
          as: "project",
          include: [
            {
              model: Client,
              as: "client",
            },
          ],
        },
      ],
    })

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    res.json(payment)
  } catch (error) {
    console.error("Get payment error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const createPayment = async (req, res) => {
  try {
    const { projectId, amount, method, paymentMethod, reference, notes, paymentDate } = req.body

    // Handle both 'method' and 'paymentMethod' field names for compatibility
    const finalMethod = method || paymentMethod

    // Verify project exists
    const project = await Project.findByPk(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    const payment = await Payment.create({
      projectId,
      amount: Number.parseFloat(amount),
      method: finalMethod,
      reference,
      notes,
      paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      status: "completed",
    })

    const paymentWithProject = await Payment.findByPk(payment.id, {
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "title", "totalPrice"],
          include: [
            {
              model: Client,
              as: "client",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
    })

    res.status(201).json(paymentWithProject)
  } catch (error) {
    console.error("Create payment error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const updatePayment = async (req, res) => {
  try {
    const { id } = req.params
    const { amount, method, paymentMethod, reference, notes, status, paymentDate } = req.body

    const updateData = {}

    if (amount !== undefined) updateData.amount = Number.parseFloat(amount)
    // Handle both 'method' and 'paymentMethod' field names for compatibility
    if (method || paymentMethod) updateData.method = method || paymentMethod
    if (reference !== undefined) updateData.reference = reference
    if (notes !== undefined) updateData.notes = notes
    if (status) updateData.status = status
    if (paymentDate) updateData.paymentDate = new Date(paymentDate)

    const [updatedRowsCount] = await Payment.update(updateData, {
      where: { id },
    })

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: "Payment not found" })
    }

    const updatedPayment = await Payment.findByPk(id, {
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "title", "totalPrice"],
          include: [
            {
              model: Client,
              as: "client",
              attributes: ["id", "firstName", "lastName"],
            },
          ],
        },
      ],
    })

    res.json(updatedPayment)
  } catch (error) {
    console.error("Update payment error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const deletePayment = async (req, res) => {
  try {
    const { id } = req.params

    const deletedRowsCount = await Payment.destroy({
      where: { id },
    })

    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: "Payment not found" })
    }

    res.json({ message: "Payment deleted successfully" })
  } catch (error) {
    console.error("Delete payment error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const getPaymentsByProject = async (req, res) => {
  try {
    const { projectId } = req.params

    const payments = await Payment.findAll({
      where: { projectId },
      order: [["paymentDate", "DESC"]],
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["title"],
          include: [
            {
              model: Client,
              as: "client",
              attributes: ["firstName", "lastName"],
            },
          ],
        },
      ],
    })

    res.json({ payments })
  } catch (error) {
    console.error("Get payments by project error:", error)
    res.status(500).json({ message: "Erreur interne du serveur" })
  }
}

const getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate, projectId } = req.query

    const whereClause = { status: "completed" }
    if (projectId) whereClause.projectId = projectId

    if (startDate && endDate) {
      whereClause.paymentDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      }
    }

    const stats = await Payment.findAll({
      where: whereClause,
      attributes: [
        "method",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
        [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
      ],
      group: ["method"],
    })

    const totalStats = await Payment.findOne({
      where: whereClause,
      attributes: [
        [sequelize.fn("COUNT", sequelize.col("id")), "totalCount"],
        [sequelize.fn("SUM", sequelize.col("amount")), "totalAmount"],
      ],
    })

    const formattedStats = {
      byMethod: stats.reduce((acc, stat) => {
        acc[stat.method] = {
          count: Number.parseInt(stat.dataValues.count),
          totalAmount: Number.parseFloat(stat.dataValues.totalAmount) || 0,
        }
        return acc
      }, {}),
      total: {
        count: Number.parseInt(totalStats.dataValues.totalCount) || 0,
        totalAmount: Number.parseFloat(totalStats.dataValues.totalAmount) || 0,
      },
    }

    res.json(formattedStats)
  } catch (error) {
    console.error("Get payment stats error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = {
  getAllPayments,
  getPaymentById,
  getPaymentsByProject,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStats,
}
