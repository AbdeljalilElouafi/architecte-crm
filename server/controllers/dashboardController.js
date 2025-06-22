const { User, Project, Client, Payment } = require("../models")
const { Op } = require("sequelize")

const getStats = async (req, res) => {
  try {
    // Get current date for monthly calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Overview stats
    const totalClients = await Client.count()

    const activeProjects = await Project.count({
      where: {
        status: {
          [Op.in]: ["planning", "in_progress", "review"],
        },
      },
    })

    const totalRevenue = (await Payment.sum("amount")) || 0

    const monthlyRevenue =
      (await Payment.sum("amount", {
        where: {
          paymentDate: {
            [Op.gte]: startOfMonth,
          },
        },
      })) || 0

    // Recent activity
    const recentProjects = await Project.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["firstName", "lastName"],
        },
      ],
    })

    const recentPayments = await Payment.findAll({
      limit: 5,
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

    // Status distribution
    const statusDistribution = await Project.findAll({
      attributes: ["status", [Project.sequelize.fn("COUNT", Project.sequelize.col("status")), "count"]],
      group: ["status"],
    })

    const statusCounts = {}
    statusDistribution.forEach((item) => {
      statusCounts[item.status] = Number.parseInt(item.dataValues.count)
    })

    // Overdue projects (projects with unpaid invoices past due date)
    const overdueProjects = await Project.findAll({
      where: {
        status: {
          [Op.ne]: "completed",
        },
      },
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["firstName", "lastName"],
        },
      ],
      // You might want to add more complex logic here based on your payment structure
      limit: 10,
    })

    const stats = {
      overview: {
        totalClients,
        activeProjects,
        totalRevenue,
        monthlyRevenue,
      },
      recentActivity: {
        projects: recentProjects,
        payments: recentPayments,
      },
      charts: {
        statusDistribution: statusCounts,
      },
      alerts: {
        overdueProjects: overdueProjects.slice(0, 5), // Show only first 5
      },
    }

    res.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des statistiques" })
  }
}

const getMonthlyRevenue = async (req, res) => {
  try {
    const { year = new Date().getFullYear() } = req.query

    const monthlyData = await Payment.findAll({
      attributes: [
        [Payment.sequelize.fn("MONTH", Payment.sequelize.col("paymentDate")), "month"],
        [Payment.sequelize.fn("SUM", Payment.sequelize.col("amount")), "total"],
      ],
      where: {
        paymentDate: {
          [Op.between]: [new Date(year, 0, 1), new Date(year, 11, 31)],
        },
      },
      group: [Payment.sequelize.fn("MONTH", Payment.sequelize.col("paymentDate"))],
      order: [[Payment.sequelize.fn("MONTH", Payment.sequelize.col("paymentDate")), "ASC"]],
    })

    // Fill in missing months with 0
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0,
    }))

    monthlyData.forEach((item) => {
      const monthIndex = Number.parseInt(item.dataValues.month) - 1
      months[monthIndex].total = Number.parseFloat(item.dataValues.total) || 0
    })

    res.json(months)
  } catch (error) {
    console.error("Monthly revenue error:", error)
    res.status(500).json({ message: "Erreur lors de la récupération des revenus mensuels" })
  }
}

module.exports = {
  getStats,
  getMonthlyRevenue,
}
