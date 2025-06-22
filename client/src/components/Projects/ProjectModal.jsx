"use client"

import { useState, useEffect } from "react"
import { projectsAPI } from "../../services/api.jsx"
import Modal from "../Common/Modal"
import Select from "react-select"

export default function ProjectModal({ project, clients, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "new_build",
    description: "",
    status: "planning",
    startDate: "",
    endDate: "",
    totalPrice: "",
    location: "",
    priority: "medium",
    clientId: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || "",
        type: project.type || "new_build",
        description: project.description || "",
        status: project.status || "planning",
        startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
        totalPrice: project.totalPrice || "",
        location: project.location || "",
        priority: project.priority || "medium",
        clientId: project.clientId || "",
      })
    }
  }, [project])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = "Le titre est requis"
    if (!formData.clientId) newErrors.clientId = "Le client est requis"
    if (!formData.type) newErrors.type = "Le type de projet est requis"
    if (formData.totalPrice && isNaN(Number(formData.totalPrice))) {
      newErrors.totalPrice = "Le prix total doit être un nombre valide"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = {
        ...formData,
        totalPrice: formData.totalPrice ? Number(formData.totalPrice) : 0,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      }

      if (project) {
        await projectsAPI.update(project.id, submitData)
      } else {
        await projectsAPI.create(submitData)
      }
      onClose(true)
    } catch (error) {
      console.error("Échec de l'enregistrement du projet:", error)
      setErrors({ submit: error.response?.data?.message || "Échec de l'enregistrement du projet" })
    } finally {
      setLoading(false)
    }
  }

return (
  <Modal title={project ? "Modifier le projet" : "Ajouter un nouveau projet"} onClose={() => onClose(false)}>
    <div className="bg-indigo-200 hover:bg-indigo-500 rounded-lg p-4 border border-blue-100">
      <form onSubmit={handleSubmit} className="space-y-2">
        {errors.submit && (
          <div className="bg-red-100 border-l-4 border-red-400 text-red-700 px-3 py-2 rounded-r text-sm">
            {errors.submit}
          </div>
        )}

        {/* Project Basic Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-1 h-5 bg-blue-500 rounded-full mr-2"></div>
            <h3 className="text-sm font-semibold text-gray-800">Informations de base</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Titre *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Titre du projet"
                className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                  errors.title 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                }`}
              />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Client *</label>
                <Select
                  options={clients.map(client => ({
                    value: client.id,
                    label: `${client.firstName} ${client.lastName}`
                  }))}
                  value={clients.find(c => c.id === formData.clientId) ? {
                    value: formData.clientId,
                    label: `${clients.find(c => c.id === formData.clientId).firstName} ${clients.find(c => c.id === formData.clientId).lastName}`
                  } : null}
                  onChange={(selectedOption) => {
                    setFormData(prev => ({
                      ...prev,
                      clientId: selectedOption ? selectedOption.value : ''
                    }))
                    if (errors.clientId) {
                      setErrors(prev => ({ ...prev, clientId: '' }))
                    }
                  }}
                  isClearable
                  placeholder="Rechercher des clients..."
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                >
                  <option value="new_build">Nouvelle construction</option>
                  <option value="renovation">Rénovation</option>
                  <option value="extension">Extension</option>
                  <option value="interior_design">Design d'intérieur</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-1 h-5 bg-green-500 rounded-full mr-2"></div>
            <h3 className="text-sm font-semibold text-gray-800">Détails du projet</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              >
                <option value="planning">Planification</option>
                <option value="in_progress">En cours</option>
                <option value="review">Révision</option>
                <option value="completed">Terminé</option>
                <option value="on_hold">En attente</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Priorité</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date de début</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date de fin</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Financial & Location Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-1 h-5 bg-orange-500 rounded-full mr-2"></div>
            <h3 className="text-sm font-semibold text-gray-800">Informations financières & localisation</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prix total (MAD)</label>
              <input
                type="number"
                name="totalPrice"
                value={formData.totalPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                  errors.totalPrice 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                }`}
              />
              {errors.totalPrice && <p className="mt-1 text-xs text-red-600">{errors.totalPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Localisation</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
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
            {loading ? "Enregistrement..." : project ? "Mettre à jour" : "Créer"}
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