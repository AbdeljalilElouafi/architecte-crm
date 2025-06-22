const express = require("express")
const { getStats, getMonthlyRevenue } = require("../controllers/dashboardController")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

router.get("/stats", authenticateToken, getStats)
router.get("/monthly-revenue", authenticateToken, getMonthlyRevenue)

module.exports = router
