const { Client, Project, Payment, Document } = require("../models")
const { Op, sequelize } = require("sequelize")

const getDashboardStats = async (req, res) => {
  try {
    // Get current date for filtering
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Total counts
    const totalClients = await Client.count({ where: { status: "active" } })
    const totalProjects = await Project.count()
    const activeProjects = await Project.count({
      where: { status: { [Op.in]: ["planning", "in_progress"] } },
    })
    const completedProjects = await Project.count({ where: { status: "completed" } })

    // Financial stats
    const totalRevenue = await Payment.sum("amount", {
      where: { status: "completed" },
    })
    const monthlyRevenue = await Payment.sum("amount", {
      where: {
        status: "completed",
        paymentDate: { [Op.gte]: startOfMonth },
      },
    })

    // Recent activities
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
      where: { status: "completed" },
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

    const recentDocuments = await Document.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["firstName", "lastName"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["title"],
        },
      ],
    })

    // Overdue payments (projects with remaining balance and no recent payments)
    const overdueProjects = await Project.findAll({
      where: {
        status: { [Op.in]: ["planning", "in_progress"] },
        totalPrice: { [Op.gt]: 0 },
      },
      include: [
        {
          model: Client,
          as: "client",
          attributes: ["firstName", "lastName"],
        },
        {
          model: Payment,
          as: "payments",
          where: { status: "completed" },
          required: false,
        },
      ],
    })

    // Filter projects with remaining balance
    const projectsWithBalance = overdueProjects.filter((project) => {
      const totalPaid = project.payments.reduce((sum, payment) => sum + Number.parseFloat(payment.amount), 0)
      const remainingBalance = Number.parseFloat(project.totalPrice) - totalPaid
      return remainingBalance > 0
    })

    // Project status distribution
    const projectsByStatus = await Project.findAll({
      attributes: ["status", [sequelize.fn("COUNT", sequelize.col("id")), "count"]],
      group: ["status"],
    })

    const statusDistribution = projectsByStatus.reduce((acc, item) => {
      acc[item.status] = Number.parseInt(item.dataValues.count)
      return acc
    }, {})

    // Monthly revenue trend (last 6 months)
    const monthlyTrend = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthRevenue = await Payment.sum("amount", {
        where: {
          status: "completed",
          paymentDate: {
            [Op.between]: [monthStart, monthEnd],
          },
        },
      })

      monthlyTrend.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        revenue: Number.parseFloat(monthRevenue) || 0,
      })
    }

    res.json({
      overview: {
        totalClients,
        totalProjects,
        activeProjects,
        completedProjects,
        totalRevenue: Number.parseFloat(totalRevenue) || 0,
        monthlyRevenue: Number.parseFloat(monthlyRevenue) || 0,
      },
      recentActivity: {
        projects: recentProjects,
        payments: recentPayments,
        documents: recentDocuments,
      },
      alerts: {
        overdueProjects: projectsWithBalance.slice(0, 5),
        projectsNeedingAttention: activeProjects,
      },
      charts: {
        statusDistribution,
        monthlyTrend,
      },
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

module.exports = {
  getDashboardStats,
}
