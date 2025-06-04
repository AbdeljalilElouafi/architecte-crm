const express = require("express")
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats,
} = require("../controllers/projectController")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

router.use(authenticateToken)

router.get("/", getAllProjects)
router.get("/stats", getProjectStats)
router.get("/:id", getProjectById)
router.post("/", createProject)
router.put("/:id", updateProject)
router.delete("/:id", deleteProject)

module.exports = router
