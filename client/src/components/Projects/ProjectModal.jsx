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

  const getClientOptions = () => {
    if (!clients || !Array.isArray(clients)) return []
    return clients.map((client) => ({
      value: client.id,
      label: client.clientType === "individual" ? `${client.firstName} ${client.lastName}` : client.companyName,
    }))
  }

  const getSelectedClient = () => {
    const client = clients.find((c) => c.id === formData.clientId)
    return client
      ? {
          value: client.id,
          label: client.clientType === "individual" ? `${client.firstName} ${client.lastName}` : client.companyName,
        }
      : null
  }

  return (
    <Modal
      title={project ? "Modifier le projet" : "Ajouter un nouveau projet"}
      onClose={() => onClose(false)}
      size="lg"
    >
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="bg-red-100 border-l-4 border-red-400 text-red-700 px-3 py-2 rounded-r text-sm">
              {errors.submit}
            </div>
          )}

{/* Basic Info */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-1 h-5 bg-blue-500 rounded-full mr-2"></div>
              <h3 className="text-sm font-semibold text-gray-800">Informations de base</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Titre *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Titre du projet"
                  className={`w-full px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-1 ${
                    errors.title
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                  }`}
                />
                {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Client *</label>
                <Select
                  options={getClientOptions()}
                  value={getSelectedClient()}
                  onChange={(selectedOption) =>
                    setFormData((prev) => ({ ...prev, clientId: selectedOption ? selectedOption.value : "" }))
                  }
                  isClearable
                  placeholder="Sélectionner un client..."
                  classNamePrefix="select"
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      minHeight: "38px",
                      borderColor: errors.clientId ? "#fca5a5" : "#d1d5db",
                      backgroundColor: errors.clientId ? "#fef2f2" : "#f9fafb",
                    }),
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
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50"
                >
                  <option value="new_build">Nouvelle construction</option>
                  <option value="renovation">Rénovation</option>
                  <option value="extension">Extension</option>
                  <option value="interior_design">Design d'intérieur</option>
                  <option value="consultation">Consultation</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={1}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50 resize-none"
                  placeholder="Description du projet..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50"
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
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50"
                >
                  <option value="low">Basse</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Haute</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Financial & Location Info */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center mb-3">
              <div className="w-1 h-5 bg-orange-500 rounded-full mr-2"></div>
              <h3 className="text-sm font-semibold text-gray-800">Informations financières & localisation</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Prix total (MAD)</label>
                <input
                  type="number"
                  name="totalPrice"
                  value={formData.totalPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full px-3 py-2 text-sm rounded-md border transition-colors ${
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
                  placeholder="Ville, région..."
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50"
                />
              </div>

              <div />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row-reverse gap-2 pt-3 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : project ? "Mettre à jour" : "Créer"}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-md border border-gray-300 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
