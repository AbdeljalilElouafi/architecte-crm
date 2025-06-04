const express = require("express")
const {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} = require("../controllers/clientController")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

router.use(authenticateToken)

router.get("/", getAllClients)
router.get("/:id", getClientById)
router.post("/", createClient)
router.put("/:id", updateClient)
router.delete("/:id", deleteClient)

module.exports = router
