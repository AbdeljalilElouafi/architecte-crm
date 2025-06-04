"use client"

import { useState, useRef } from "react"
import { documentsAPI } from "../../services/api.jsx"
import Modal from "../Common/Modal"
import { DocumentIcon } from "@heroicons/react/24/outline"

export default function DocumentUploadModal({ clients, projects, documentTypes, onClose }) {
  const [formData, setFormData] = useState({
    type: "other",
    price: "",
    description: "",
    clientId: "",
    projectId: "",
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
      if (errors.file) {
        setErrors((prev) => ({ ...prev, file: "" }))
      }
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!selectedFile) newErrors.file = "Please select a file to upload"
    if (!formData.type) newErrors.type = "Document type is required"
    if (!formData.clientId && !formData.projectId) {
      newErrors.clientId = "Please select either a client or a project"
    }
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = "Price must be a valid number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", selectedFile)
      uploadFormData.append("type", formData.type)
      uploadFormData.append("price", formData.price || 0)
      uploadFormData.append("description", formData.description || "")

      if (formData.clientId) {
        uploadFormData.append("clientId", formData.clientId)
      }

      if (formData.projectId) {
        uploadFormData.append("projectId", formData.projectId)
      }

      await documentsAPI.upload(uploadFormData)
      onClose(true)
    } catch (error) {
      console.error("Failed to upload document:", error)
      setErrors({ submit: error.response?.data?.message || "Failed to upload document" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Upload Document" onClose={() => onClose(false)}>
      <form onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{errors.submit}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">File *</label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                errors.file ? "border-red-300" : "border-gray-300"
              } hover:border-gray-400 cursor-pointer`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload a file</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.dwg"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, Word, Excel, Images up to 50MB</p>
              </div>
            </div>
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: <span className="font-medium">{selectedFile.name}</span> (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Document Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.type ? "border-red-300" : ""
              }`}
            >
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.clientId ? "border-red-300" : ""
                }`}
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.firstName} {client.lastName}
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Project</label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (MAD)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.price ? "border-red-300" : ""
              }`}
              placeholder="0.00"
            />
            {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Add any additional details about this document..."
            />
          </div>
        </div>

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
