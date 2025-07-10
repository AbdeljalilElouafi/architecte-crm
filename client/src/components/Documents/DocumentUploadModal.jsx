"use client"

import { useState, useEffect } from "react"
import { documentsAPI, projectsAPI } from "../../services/api.jsx"
import Modal from "../Common/Modal"
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from "@heroicons/react/24/outline"

export default function DocumentUploadModal({ document, projects, projectId, onClose }) {
  const [formData, setFormData] = useState({
    projectId: projectId || "",
    title: "",
    description: "",
    category: "contract",
  })

  const [selectedFiles, setSelectedFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [availableProjects, setAvailableProjects] = useState(projects || [])
  const [dragActive, setDragActive] = useState(false)

  // Fetch projects if not provided and no projectId is set
  useEffect(() => {
    if (!projects && !projectId) {
      fetchProjects()
    }
  }, [projects, projectId])

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll({ limit: 100 })
      setAvailableProjects(response.data.projects || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  useEffect(() => {
    if (document) {
      setFormData({
        projectId: document.projectId || projectId || "",
        title: document.title || "",
        description: document.description || "",
        category: document.category || "contract",
      })
    } else if (projectId) {
      // Pre-select project if projectId is provided
      setFormData((prev) => ({ ...prev, projectId }))
    }
  }, [document, projectId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    setSelectedFiles((prev) => [...prev, ...files])
    if (errors.files) {
      setErrors((prev) => ({ ...prev, files: "" }))
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    setSelectedFiles((prev) => [...prev, ...files])
    if (errors.files) {
      setErrors((prev) => ({ ...prev, files: "" }))
    }
  }

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.projectId) newErrors.projectId = "Un projet est requis"
    if (!formData.title.trim()) newErrors.title = "Le titre est requis"
    if (!document && selectedFiles.length === 0) newErrors.files = "Au moins un fichier est requis"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const formDataToSend = new FormData()

      // Add form fields
      formDataToSend.append("projectId", formData.projectId)
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("category", formData.category)

      // Add files
      selectedFiles.forEach((file, index) => {
        formDataToSend.append("documents", file)
      })

      if (document) {
        await documentsAPI.update(document.id, formDataToSend)
      } else {
        await documentsAPI.upload(formDataToSend)
      }

      onClose(true)
    } catch (error) {
      console.error("Échec de l'enregistrement du document:", error)
      setErrors({ submit: error.response?.data?.message || "Échec de l'enregistrement du document" })
    } finally {
      setLoading(false)
    }
  }

  const getSelectedProject = () => {
    return availableProjects.find((p) => p.id === formData.projectId)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Modal
      title={document ? "Modifier le document" : "Téléverser un document"}
      onClose={() => onClose(false)}
      size="lg"
    >
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r text-sm">
              {errors.submit}
            </div>
          )}

          {/* Document Info */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-800">Informations du document</h3>
            </div>

            <div className="space-y-4">
              {/* First Row: Project and Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Projet *</label>
                  {projectId ? (
                    // Show read-only project when projectId is provided
                    <div className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-100 text-gray-700">
                      {getSelectedProject()?.title || "Projet sélectionné"}
                    </div>
                  ) : (
                    // Show dropdown when no projectId is provided
                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                        errors.projectId
                          ? "border-red-300 bg-red-50 focus:border-red-500"
                          : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                      }`}
                    >
                      <option value="">Sélectionner un projet</option>
                      {availableProjects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title} - {project.client?.firstName} {project.client?.lastName}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.projectId && <p className="mt-1 text-xs text-red-600">{errors.projectId}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Titre *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Nom du document"
                    className={`w-full px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                      errors.title
                        ? "border-red-300 bg-red-50 focus:border-red-500"
                        : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                  {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                </div>
              </div>

              {/* Second Row: Category and Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                  >
                    <option value="contract">📄 Contrat</option>
                    <option value="plan">📐 Plan</option>
                    <option value="invoice">🧾 Facture</option>
                    <option value="permit">📋 Permis</option>
                    <option value="photo">📸 Photo</option>
                    <option value="other">📁 Autre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={1}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white resize-none"
                    placeholder="Description du document..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* File Upload */}
          {!document && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-800">Fichiers</h3>
              </div>

              {/* Drag and Drop Area */}
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-blue-400 bg-blue-50"
                    : errors.files
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 bg-gray-50 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.dwg,.dxf"
                />
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600">Cliquez pour téléverser</span> ou glissez-déposez
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, Images, DWG jusqu'à 10MB chacun</p>
              </div>

              {errors.files && <p className="mt-1 text-xs text-red-600">{errors.files}</p>}

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Fichiers sélectionnés:</h4>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                      <div className="flex items-center">
                        <DocumentIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Téléversement..." : document ? "Mettre à jour" : "Téléverser"}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-3 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}