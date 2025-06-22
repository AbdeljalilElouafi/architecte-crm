const express = require("express")
const {
  getAllPayments,
  getPaymentById,
  getPaymentsByProject,
  createPayment,
  updatePayment,
  deletePayment,
  getPaymentStats,
} = require("../controllers/paymentController")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

router.use(authenticateToken)

router.get("/", getAllPayments)
router.get("/stats", getPaymentStats)
router.get("/:id", getPaymentById)
router.post("/", createPayment)
router.get("/project/:projectId", getPaymentsByProject)
router.put("/:id", updatePayment)
router.delete("/:id", deletePayment)

module.exports = router
