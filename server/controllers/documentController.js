const { Document, Client, Project } = require("../models")
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const multer = require("multer")
const path = require("path")
const { v4: uuidv4 } = require("uuid")

// Configure S3 client for Backblaze B2
const s3Client = new S3Client({
  region: process.env.B2_REGION || "us-west-004",
  endpoint: process.env.B2_ENDPOINT || "https://s3.us-west-004.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.B2_ACCESS_KEY_ID,
    secretAccessKey: process.env.B2_SECRET_ACCESS_KEY,
  },
})

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common document and image types
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type"), false)
    }
  },
})

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const { clientId, projectId, type, price = 0, description } = req.body

    if (!clientId && !projectId) {
      return res.status(400).json({ message: "Either clientId or projectId is required" })
    }

    // Generate unique file key
    const fileExtension = path.extname(req.file.originalname)
    const fileKey = `documents/${uuidv4()}${fileExtension}`

    // Upload to Backblaze B2
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: fileKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      Metadata: {
        originalName: req.file.originalname,
        uploadedBy: req.user.id.toString(),
      },
    })

    await s3Client.send(uploadCommand)

    // Generate file URL
    const fileUrl = `${process.env.B2_ENDPOINT}/${process.env.B2_BUCKET_NAME}/${fileKey}`

    // Save document record to database
    const document = await Document.create({
      name: req.file.originalname,
      originalName: req.file.originalname,
      type: type || "other",
      fileUrl,
      fileKey,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      price: Number.parseFloat(price),
      description,
      clientId: clientId || null,
      projectId: projectId || null,
    })

    // Fetch the document with associations
    const documentWithAssociations = await Document.findByPk(document.id, {
      include: [
        { model: Client, as: "client", attributes: ["id", "firstName", "lastName"] },
        { model: Project, as: "project", attributes: ["id", "title"] },
      ],
    })

    res.status(201).json(documentWithAssociations)
  } catch (error) {
    console.error("Upload document error:", error)
    res.status(500).json({ message: "Failed to upload document" })
  }
}

const getAllDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, clientId, projectId, type } = req.query
    const offset = (page - 1) * limit

    const whereClause = {}
    if (clientId) whereClause.clientId = clientId
    if (projectId) whereClause.projectId = projectId
    if (type) whereClause.type = type

    const { count, rows } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        { model: Client, as: "client", attributes: ["id", "firstName", "lastName"] },
        { model: Project, as: "project", attributes: ["id", "title"] },
      ],
      limit: Number.parseInt(limit),
      offset: Number.parseInt(offset),
      order: [["createdAt", "DESC"]],
    })

    res.json({
      documents: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: Number.parseInt(page),
      totalDocuments: count,
    })
  } catch (error) {
    console.error("Get documents error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params
    const document = await Document.findByPk(id, {
      include: [
        { model: Client, as: "client" },
        { model: Project, as: "project" },
      ],
    })

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    res.json(document)
  } catch (error) {
    console.error("Get document error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params
    const document = await Document.findByPk(id)

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Generate signed URL for download
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: document.fileKey,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }) // 1 hour

    res.json({ downloadUrl: signedUrl })
  } catch (error) {
    console.error("Download document error:", error)
    res.status(500).json({ message: "Failed to generate download URL" })
  }
}

const updateDocument = async (req, res) => {
  try {
    const { id } = req.params
    const { type, price, description } = req.body

    const [updatedRowsCount] = await Document.update(
      { type, price: Number.parseFloat(price), description },
      { where: { id } },
    )

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: "Document not found" })
    }

    const updatedDocument = await Document.findByPk(id, {
      include: [
        { model: Client, as: "client", attributes: ["id", "firstName", "lastName"] },
        { model: Project, as: "project", attributes: ["id", "title"] },
      ],
    })

    res.json(updatedDocument)
  } catch (error) {
    console.error("Update document error:", error)
    res.status(500).json({ message: "Internal server error" })
  }
}

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params
    const document = await Document.findByPk(id)

    if (!document) {
      return res.status(404).json({ message: "Document not found" })
    }

    // Delete from Backblaze B2
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: document.fileKey,
    })

    await s3Client.send(deleteCommand)

    // Delete from database
    await document.destroy()

    res.json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("Delete document error:", error)
    res.status(500).json({ message: "Failed to delete document" })
  }
}

module.exports = {
  upload,
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
}
