"use client"

import { useState, useEffect } from "react"
import { clientsAPI } from "../../services/api.jsx"
import Modal from "../Common/Modal"

export default function ClientModal({ client, onClose }) {
  const [clientType, setClientType] = useState("individual")
  const [formData, setFormData] = useState({
    clientType: "individual",
    // Individual fields
    firstName: "",
    lastName: "",
    cin: "",
    // Corporate fields
    companyName: "",
    rc: "",
    ice: "",
    headquarters: "",
    // Common fields
    email: "",
    phone: "",
    address: "",
    notes: "",
    status: "active",
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (client) {
      setClientType(client.clientType || "individual")
      setFormData({
        clientType: client.clientType || "individual",
        firstName: client.firstName || "",
        lastName: client.lastName || "",
        cin: client.cin || "",
        companyName: client.companyName || "",
        rc: client.rc || "",
        ice: client.ice || "",
        headquarters: client.headquarters || "",
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
        notes: client.notes || "",
        status: client.status || "active",
      })
    }
  }, [client])

  const handleClientTypeChange = (type) => {
    setClientType(type)
    setFormData((prev) => ({ ...prev, clientType: type }))
    setErrors({}) // Clear errors when switching types
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Common validations
    if (!formData.email.trim()) newErrors.email = "L'email est requis"
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "L'email est invalide"

    // Type-specific validations
    if (clientType === "individual") {
      if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis"
      if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis"
      if (!formData.cin.trim()) newErrors.cin = "Le CIN est requis"
    } else if (clientType === "corporate") {
      if (!formData.companyName.trim()) newErrors.companyName = "La raison sociale est requise"
      if (!formData.rc.trim()) newErrors.rc = "Le RC est requis"
      if (!formData.ice.trim()) newErrors.ice = "L'ICE est requis"
      if (!formData.headquarters.trim()) newErrors.headquarters = "Le siège social est requis"
    }

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
      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r text-sm">
              {errors.submit}
            </div>
          )}

          {/* Client Type Selection */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-indigo-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-800">Type de client</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleClientTypeChange("individual")}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  clientType === "individual"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">👤</div>
                  <div className="font-semibold">Personne physique</div>
                  <div className="text-sm opacity-75">Client individuel</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleClientTypeChange("corporate")}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  clientType === "corporate"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">🏢</div>
                  <div className="font-semibold">Personne morale</div>
                  <div className="text-sm opacity-75">Entreprise/Organisation</div>
                </div>
              </button>
            </div>
          </div>

          {/* Individual Client Fields */}
          {clientType === "individual" && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-800">Informations personnelles</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CIN *</label>
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
          )}

          {/* Corporate Client Fields */}
          {clientType === "corporate" && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-1 h-6 bg-green-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-semibold text-gray-800">Informations de l'entreprise</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Raison sociale *</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Nom de l'entreprise"
                    className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                      errors.companyName
                        ? "border-red-300 bg-red-50 focus:border-red-500"
                        : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                  {errors.companyName && <p className="mt-1 text-xs text-red-600">{errors.companyName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">RC *</label>
                    <input
                      type="text"
                      name="rc"
                      value={formData.rc}
                      onChange={handleChange}
                      placeholder="Registre de Commerce"
                      className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                        errors.rc
                          ? "border-red-300 bg-red-50 focus:border-red-500"
                          : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                      }`}
                    />
                    {errors.rc && <p className="mt-1 text-xs text-red-600">{errors.rc}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ICE *</label>
                    <input
                      type="text"
                      name="ice"
                      value={formData.ice}
                      onChange={handleChange}
                      placeholder="Identifiant Commun de l'Entreprise"
                      className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                        errors.ice
                          ? "border-red-300 bg-red-50 focus:border-red-500"
                          : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                      }`}
                    />
                    {errors.ice && <p className="mt-1 text-xs text-red-600">{errors.ice}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Siège social *</label>
                  <textarea
                    name="headquarters"
                    rows={3}
                    value={formData.headquarters}
                    onChange={handleChange}
                    placeholder="Adresse du siège social"
                    className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 resize-none ${
                      errors.headquarters
                        ? "border-red-300 bg-red-50 focus:border-red-500"
                        : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                    }`}
                  />
                  {errors.headquarters && <p className="mt-1 text-xs text-red-600">{errors.headquarters}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Common Fields */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-orange-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-800">Informations de contact</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone *</label>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
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
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse</label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Adresse..."
                  className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
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
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : client ? "Mettre à jour" : "Créer le client"}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-3 bg-white text-gray-700 text-sm font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
