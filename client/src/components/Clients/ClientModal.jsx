"use client"

import { useState, useEffect } from "react"
import { clientsAPI } from "../../services/api.jsx"
import Modal from "../Common/Modal"

export default function ClientModal({ client, onClose }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    cin: "",
    notes: "",
    status: "active",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (client) {
      setFormData({
        firstName: client.firstName || "",
        lastName: client.lastName || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        cin: client.cin || "",
        notes: client.notes || "",
        status: client.status || "active",
      })
    }
  }, [client])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis"
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis"
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email est invalide"
    if (!formData.cin.trim()) newErrors.cin = "Le CIN est requis"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      if (client) {
        await clientsAPI.update(client.id, formData)
      } else {
        await clientsAPI.create(formData)
      }
      onClose(true)
    } catch (error) {
      console.error("Échec de l'enregistrement du client:", error)
      setErrors({ submit: error.response?.data?.message || "Échec de l'enregistrement du client" })
    } finally {
      setLoading(false)
    }
  }

return (
  <Modal title={client ? "Modifier le client" : "Ajouter un nouveau client"} onClose={() => onClose(false)}>
    <div className="bg-indigo-200 hover:bg-indigo-500 rounded-lg p-4 border border-blue-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-100 border-l-4 border-red-400 text-red-700 px-3 py-2 rounded-r text-sm">
            {errors.submit}
          </div>
        )}

        {/* Personal Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-1 h-5 bg-blue-500 rounded-full mr-2"></div>
            <h3 className="text-sm font-semibold text-gray-800">Informations personnelles</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Entrez le prénom"
                className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                  errors.firstName 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                }`}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Entrez le nom"
                className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                  errors.lastName 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                }`}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
            </div>
          </div>
        </div>

        {/* Contact & Legal Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-1 h-5 bg-green-500 rounded-full mr-2"></div>
            <h3 className="text-sm font-semibold text-gray-800">Contact & informations légales</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="exemple@email.com"
                className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                  errors.email 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+212 6XX XXX XXX"
                  className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CIN *</label>
                <input
                  type="text"
                  name="cin"
                  value={formData.cin}
                  onChange={handleChange}
                  placeholder="XX123456"
                  className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                    errors.cin 
                      ? "border-red-300 bg-red-50 focus:border-red-500" 
                      : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                  }`}
                />
                {errors.cin && <p className="mt-1 text-xs text-red-600">{errors.cin}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-1 h-5 bg-orange-500 rounded-full mr-2"></div>
            <h3 className="text-sm font-semibold text-gray-800">Informations additionnelles</h3>
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
                <option value="active">🟢 Actif</option>
                <option value="inactive">🟡 Inactif</option>
                <option value="archived">🔴 Archivé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse</label>
              <textarea
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                placeholder="Adresse..."
                className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white resize-none"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="Notes ou commentaires..."
              className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row-reverse gap-2 pt-3 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-black text-sm font-semibold rounded-md shadow hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : client ? "Mettre à jour" : "Créer"}
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