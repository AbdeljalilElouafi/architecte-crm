const backblaze = require('../services/backblaze');
const { Document, Client, Project } = require('../models');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Multer configuration remains the same
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { clientId, projectId, type, price = 0, description } = req.body;

    // Upload to Backblaze
    const uploadResult = await backblaze.uploadFile(req.file);

    // Create document record
    const document = await Document.create({
      name: req.file.originalname,
      originalName: req.file.originalname,
      type: type || "other",
      fileUrl: uploadResult.downloadUrl,
      fileKey: uploadResult.fileName,
      fileId: uploadResult.fileId,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      price: Number(price),
      description,
      clientId: clientId || null,
      projectId: projectId || null,
    });

    const documentWithAssociations = await Document.findByPk(document.id, {
      include: [
        { model: Client, as: "client", attributes: ["id", "firstName", "lastName"] },
        { model: Project, as: "project", attributes: ["id", "title"] },
      ],
    });

    res.status(201).json(documentWithAssociations);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};

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
    const { id } = req.params;
    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Redirect to the direct download URL
    res.redirect(document.fileUrl);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Download failed" });
  }
};

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
    const { id } = req.params;
    const document = await Document.findByPk(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Delete from Backblaze
    await backblaze.deleteFile(document.fileKey);

    // Delete from database
    await document.destroy();

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Delete failed", error: error.message });
  }
};

module.exports = {
  upload,
  uploadDocument,
  getAllDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
}
