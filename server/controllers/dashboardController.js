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

    // Debug logs
    console.log("Dashboard Stats Debug:")
    console.log("- Total Clients:", totalClients)
    console.log("- Active Projects:", activeProjects)
    console.log("- Total Revenue:", totalRevenue)
    console.log("- Monthly Revenue:", monthlyRevenue)

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

    console.log("- Recent Payments Count:", recentPayments.length)

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
        overdueProjects: overdueProjects.slice(0, 5),
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
    let { year } = req.query

    console.log(`\n=== MONTHLY REVENUE DEBUG ===`)
    console.log(`Requested year: ${year || "not specified"}`)

    // First, let's check if we have any payments at all
    const totalPayments = await Payment.count()
    console.log(`Total payments in database: ${totalPayments}`)

    if (totalPayments === 0) {
      console.log("No payments found in database, returning empty data")
      const months = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        total: 0,
      }))
      return res.json(months)
    }

    // If no year specified, find the year with the most recent payments
    if (!year) {
      const recentPayment = await Payment.findOne({
        order: [["paymentDate", "DESC"]],
        attributes: ["paymentDate"],
      })

      if (recentPayment && recentPayment.paymentDate) {
        year = new Date(recentPayment.paymentDate).getFullYear()
        console.log(`No year specified, using year from most recent payment: ${year}`)
      } else {
        year = new Date().getFullYear()
        console.log(`No payments with dates found, defaulting to current year: ${year}`)
      }
    }

    // Get all payments for debugging - show actual data structure
    const allPayments = await Payment.findAll({
      attributes: ["id", "amount", "paymentDate", "createdAt"],
      order: [["paymentDate", "DESC"]],
    })

    console.log(`\nFound ${allPayments.length} payments:`)
    allPayments.forEach((payment, index) => {
      console.log(`Payment ${index + 1}:`, {
        id: payment.id,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        year: payment.paymentDate ? new Date(payment.paymentDate).getFullYear() : "null",
        month: payment.paymentDate ? new Date(payment.paymentDate).getMonth() + 1 : "null",
      })
    })

    // Check what years we have data for
    const yearsWithData = await Payment.findAll({
      attributes: [
        [Payment.sequelize.fn("YEAR", Payment.sequelize.col("paymentDate")), "year"],
        [Payment.sequelize.fn("COUNT", Payment.sequelize.col("id")), "count"],
        [Payment.sequelize.fn("SUM", Payment.sequelize.col("amount")), "total"],
      ],
      group: [Payment.sequelize.fn("YEAR", Payment.sequelize.col("paymentDate"))],
      order: [[Payment.sequelize.fn("YEAR", Payment.sequelize.col("paymentDate")), "DESC"]],
    })

    console.log(`\nYears with payment data:`)
    yearsWithData.forEach((yearData) => {
      console.log(
        `Year ${yearData.dataValues.year}: ${yearData.dataValues.count} payments, ${yearData.dataValues.total} MAD total`,
      )
    })

    console.log(`\nUsing year: ${year} for monthly breakdown`)

    // Manual approach - get all payments for the specified year
    const startDate = new Date(year, 0, 1) // January 1st
    const endDate = new Date(year, 11, 31, 23, 59, 59) // December 31st

    console.log(`\nQuerying payments between:`)
    console.log(`Start: ${startDate.toISOString()}`)
    console.log(`End: ${endDate.toISOString()}`)

    const allPaymentsThisYear = await Payment.findAll({
      where: {
        paymentDate: {
          [Op.between]: [startDate, endDate],
        },
      },
      attributes: ["amount", "paymentDate"],
      order: [["paymentDate", "ASC"]],
    })

    console.log(`\nPayments found for year ${year}: ${allPaymentsThisYear.length}`)
    allPaymentsThisYear.forEach((payment, index) => {
      const date = new Date(payment.paymentDate)
      console.log(
        `Payment ${index + 1}: ${payment.amount} MAD on ${date.toDateString()} (Month: ${date.getMonth() + 1})`,
      )
    })

    // Manual monthly grouping
    const manualMonthlyData = {}
    allPaymentsThisYear.forEach((payment) => {
      const month = new Date(payment.paymentDate).getMonth() + 1 // 1-12
      if (!manualMonthlyData[month]) {
        manualMonthlyData[month] = 0
      }
      manualMonthlyData[month] += Number(payment.amount) || 0
    })

    console.log("\nManual monthly calculation:", manualMonthlyData)

    // Create the final months array
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: manualMonthlyData[i + 1] || 0,
    }))

    console.log("Final months data being sent:", months)

    // Also try the SQL approach for comparison
    try {
      console.log("\n--- Trying SQL MONTH function approach ---")

      // Use raw query to be more explicit
      const [results] = await Payment.sequelize.query(
        `
        SELECT 
          MONTH(paymentDate) as month,
          SUM(amount) as total,
          COUNT(*) as count
        FROM payments 
        WHERE paymentDate BETWEEN ? AND ?
        GROUP BY MONTH(paymentDate)
        ORDER BY MONTH(paymentDate)
      `,
        {
          replacements: [startDate, endDate],
          type: Payment.sequelize.QueryTypes.SELECT,
        },
      )

      console.log("Raw SQL results:", results)

      // If SQL approach works, use it to fill the months array
      if (results && results.length > 0) {
        results.forEach((row) => {
          const monthIndex = row.month - 1
          if (monthIndex >= 0 && monthIndex < 12) {
            months[monthIndex].total = Number(row.total) || 0
          }
        })
        console.log("Updated months with SQL results:", months)
      }
    } catch (sqlError) {
      console.log("SQL approach failed:", sqlError.message)
    }

    console.log(`=== END DEBUG ===\n`)

    res.json(months)
  } catch (error) {
    console.error("Monthly revenue error:", error)
    console.error("Error stack:", error.stack)
    res.status(500).json({ message: "Erreur lors de la récupération des revenus mensuels" })
  }
}

module.exports = {
  getStats,
  getMonthlyRevenue,
}
