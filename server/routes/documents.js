const express = require("express")
const {
  upload,
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
} = require("../controllers/documentController")
const { authenticateToken } = require("../middleware/auth")

const router = express.Router()

router.use(authenticateToken)

router.get("/", getAllDocuments)
router.get("/:id", getDocumentById)
router.get("/:id/download", downloadDocument)
router.post("/upload", upload.single("file"), uploadDocument)
router.put("/:id", updateDocument)
router.delete("/:id", deleteDocument)

module.exports = router
