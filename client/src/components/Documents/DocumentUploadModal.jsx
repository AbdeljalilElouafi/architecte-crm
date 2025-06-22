"use client"

import { useState, useRef } from "react"
import { documentsAPI } from "../../services/api.jsx"
import Modal from "../Common/Modal"
import { DocumentIcon } from "@heroicons/react/24/outline"
import Select from "react-select"

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
    if (!selectedFile) newErrors.file = "Veuillez sélectionner un fichier à téléverser"
    if (!formData.type) newErrors.type = "Le type de document est requis"
    if (!formData.clientId && !formData.projectId) {
      newErrors.clientId = "Veuillez sélectionner un client ou un projet"
    }
    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = "Le prix doit être un nombre valide"
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
      console.error("Échec du téléversement du document:", error)
      setErrors({ submit: error.response?.data?.message || "Échec du téléversement du document" })
    } finally {
      setLoading(false)
    }
  }

return (
  <Modal title="Téléverser un document" onClose={() => onClose(false)}>
    <div className="bg-indigo-200 hover:bg-indigo-500 rounded-lg p-4 border border-blue-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-100 border-l-4 border-red-400 text-red-700 px-3 py-2 rounded-r text-sm">
            {errors.submit}
          </div>
        )}

        {/* File Upload Section */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-1 h-5 bg-blue-500 rounded-full mr-2"></div>
            <h3 className="text-sm font-semibold text-gray-800">Fichier</h3>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Fichier *</label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 rounded-md cursor-pointer ${
                errors.file 
                  ? "border-red-300 bg-red-50 hover:border-red-400" 
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-1 text-center">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Téléverser un fichier</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.dwg"
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">PDF, Word, Excel, Images jusqu'à 50MB</p>
              </div>
            </div>
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Sélectionné : <span className="font-medium">{selectedFile.name}</span> (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            {errors.file && <p className="mt-1 text-xs text-red-600">{errors.file}</p>}
          </div>
        </div>

        {/* Document Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-1 h-5 bg-green-500 rounded-full mr-2"></div>
            <h3 className="text-sm font-semibold text-gray-800">Informations du document</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Type de document *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                  errors.type 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                }`}
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {errors.type && <p className="mt-1 text-xs text-red-600">{errors.type}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Client *</label>
                <Select
                  options={clients.map(client => ({
                    value: client.id,
                    label: `${client.firstName} ${client.lastName}`
                  }))}
                  value={formData.clientId ? {
                    value: formData.clientId,
                    label: `${clients.find(c => c.id === formData.clientId)?.firstName || ''} ${clients.find(c => c.id === formData.clientId)?.lastName || ''}`
                  } : null}
                  onChange={(selectedOption) => {
                    const event = {
                      target: {
                        name: "clientId",
                        value: selectedOption?.value || ""
                      }
                    };
                    handleChange(event);
                  }}
                  isClearable
                  placeholder="Sélectionner un client"
                  classNamePrefix="select"
                  styles={{
                    control: (provided, state) => ({
                      ...provided,
                      borderColor: errors.clientId ? '#fca5a5' : '#d1d5db',
                      backgroundColor: errors.clientId ? '#fef2f2' : '#f9fafb',
                      '&:hover': {
                        borderColor: errors.clientId ? '#fca5a5' : '#d1d5db'
                      },
                      minHeight: '38px',
                      borderRadius: '6px',
                      borderWidth: '2px',
                      boxShadow: 'none',
                      '&:focus-within': {
                        borderColor: errors.clientId ? '#ef4444' : '#3b82f6',
                        backgroundColor: '#fff',
                        boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2)'
                      }
                    })
                  }}
                />
                {errors.clientId && <p className="mt-1 text-xs text-red-600">{errors.clientId}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Projet</label>
                <Select
                  options={projects.map(project => ({
                    value: project.id,
                    label: project.title
                  }))}
                  value={formData.projectId ? {
                    value: formData.projectId,
                    label: projects.find(p => p.id === formData.projectId)?.title || ''
                  } : null}
                  onChange={(selectedOption) => {
                    const event = {
                      target: {
                        name: "projectId",
                        value: selectedOption?.value || ""
                      }
                    };
                    handleChange(event);
                  }}
                  isClearable
                  placeholder="Sélectionner un projet"
                  classNamePrefix="select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      borderColor: '#d1d5db',
                      backgroundColor: '#f9fafb',
                      '&:hover': {
                        borderColor: '#d1d5db'
                      },
                      minHeight: '38px',
                      borderRadius: '6px',
                      borderWidth: '2px',
                      boxShadow: 'none',
                      '&:focus-within': {
                        borderColor: '#3b82f6',
                        backgroundColor: '#fff',
                        boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2)'
                      }
                    })
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prix (MAD)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                  errors.price 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white resize-none"
                placeholder="Ajoutez des détails supplémentaires sur ce document..."
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row-reverse gap-2 pt-3 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-black text-sm font-semibold rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Téléversement..." : "Téléverser"}
          </button>
          <button
            type="button"
            onClick={() => onClose(false)}
            className="px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-md border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  </Modal>
)
}