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
    // Manager fields (for corporate clients)
    managerName: "",
    managerCIN: "",
    managerPhone: "",
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
        managerName: client.managerName || "",
        managerCIN: client.managerCIN || "",
        managerPhone: client.managerPhone || "",
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
    setErrors({})
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
      // Company info required
      if (!formData.companyName.trim()) newErrors.companyName = "La raison sociale est requise"
      if (!formData.rc.trim()) newErrors.rc = "Le RC est requis"
      if (!formData.ice.trim()) newErrors.ice = "L'ICE est requis"
      if (!formData.headquarters.trim()) newErrors.headquarters = "Le siège social est requis"

      // Manager info required
      if (!formData.managerName.trim()) newErrors.managerName = "Le nom du gérant est requis"
      if (!formData.managerCIN.trim()) newErrors.managerCIN = "Le CIN du gérant est requis"
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
    <Modal title={client ? "Modifier le client" : "Ajouter un nouveau client"} onClose={() => onClose(false)} size="lg">
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-3">
          {errors.submit && (
            <div className="bg-red-100 border-l-4 border-red-400 text-red-700 px-3 py-2 rounded-r text-sm">
              {errors.submit}
            </div>
          )}

          {/* Client Type Selector */}
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-1 h-4 bg-indigo-500 rounded-full mr-2"></div>
              <h3 className="text-base font-semibold text-gray-800">Type de client</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleClientTypeChange("individual")}
                className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                  clientType === "individual"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">👤</div>
                  <div className="font-semibold text-sm">Personne physique</div>
                  <div className="text-xs opacity-75">Client individuel</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleClientTypeChange("corporate")}
                className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                  clientType === "corporate"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-lg mb-1">🏢</div>
                  <div className="font-semibold text-sm">Personne morale</div>
                  <div className="text-xs opacity-75">Entreprise + Gérant</div>
                </div>
              </button>
            </div>
          </div>

          {/* Individual Fields */}
          {clientType === "individual" && (
            <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
              <div className="flex items-center mb-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full mr-2"></div>
                <h3 className="text-base font-semibold text-gray-800">Informations personnelles</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Entrez le prénom"
                    className={`w-full px-2 py-1.5 text-sm rounded-md border ${
                      errors.firstName ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  {errors.firstName && <p className="text-xs text-red-600 mt-0.5">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Entrez le nom"
                    className={`w-full px-2 py-1.5 text-sm rounded-md border ${
                      errors.lastName ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  {errors.lastName && <p className="text-xs text-red-600 mt-0.5">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">CIN *</label>
                  <input
                    type="text"
                    name="cin"
                    value={formData.cin}
                    onChange={handleChange}
                    placeholder="XX123456"
                    className={`w-full px-2 py-1.5 text-sm rounded-md border ${
                      errors.cin ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                    }`}
                  />
                  {errors.cin && <p className="text-xs text-red-600 mt-0.5">{errors.cin}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Corporate Fields */}
          {clientType === "corporate" && (
            <>
              {/* Company Information */}
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="w-1 h-4 bg-green-500 rounded-full mr-2"></div>
                  <h3 className="text-base font-semibold text-gray-800">Informations de l'entreprise</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Raison sociale *</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Nom de l'entreprise"
                      className={`w-full px-2 py-1.5 text-sm rounded-md border ${
                        errors.companyName ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                    {errors.companyName && <p className="text-xs text-red-600 mt-0.5">{errors.companyName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">RC *</label>
                    <input
                      type="text"
                      name="rc"
                      value={formData.rc}
                      onChange={handleChange}
                      placeholder="RC"
                      className={`w-full px-2 py-1.5 text-sm rounded-md border ${
                        errors.rc ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                    {errors.rc && <p className="text-xs text-red-600 mt-0.5">{errors.rc}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">ICE *</label>
                    <input
                      type="text"
                      name="ice"
                      value={formData.ice}
                      onChange={handleChange}
                      placeholder="ICE"
                      className={`w-full px-2 py-1.5 text-sm rounded-md border ${
                        errors.ice ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                    {errors.ice && <p className="text-xs text-red-600 mt-0.5">{errors.ice}</p>}
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Siège social *</label>
                    <textarea
                      name="headquarters"
                      value={formData.headquarters}
                      onChange={handleChange}
                      rows={1}
                      placeholder="Adresse du siège social"
                      className={`w-full px-2 py-1.5 text-sm rounded-md border resize-none ${
                        errors.headquarters ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                    {errors.headquarters && <p className="text-xs text-red-600 mt-0.5">{errors.headquarters}</p>}
                  </div>
                </div>
              </div>

              {/* Manager Information */}
              <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <div className="flex items-center mb-2">
                  <div className="w-1 h-4 bg-purple-500 rounded-full mr-2"></div>
                  <h3 className="text-base font-semibold text-gray-800">Informations du gérant</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nom du gérant *</label>
                    <input
                      type="text"
                      name="managerName"
                      value={formData.managerName}
                      onChange={handleChange}
                      placeholder="Nom complet du gérant"
                      className={`w-full px-2 py-1.5 text-sm rounded-md border ${
                        errors.managerName ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                    {errors.managerName && <p className="text-xs text-red-600 mt-0.5">{errors.managerName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">CIN du gérant *</label>
                    <input
                      type="text"
                      name="managerCIN"
                      value={formData.managerCIN}
                      onChange={handleChange}
                      placeholder="XX123456"
                      className={`w-full px-2 py-1.5 text-sm rounded-md border ${
                        errors.managerCIN ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                      }`}
                    />
                    {errors.managerCIN && <p className="text-xs text-red-600 mt-0.5">{errors.managerCIN}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone du gérant</label>
                    <input
                      type="tel"
                      name="managerPhone"
                      value={formData.managerPhone}
                      onChange={handleChange}
                      placeholder="+212 XXX XXX XXX"
                      className="w-full px-2 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Contact Info */}
          <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
            <div className="flex items-center mb-2">
              <div className="w-1 h-4 bg-orange-500 rounded-full mr-2"></div>
              <h3 className="text-base font-semibold text-gray-800">Informations de contact</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-2 py-1.5 text-sm rounded-md border ${
                    errors.email ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                  }`}
                />
                {errors.email && <p className="text-xs text-red-600 mt-0.5">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50"
                >
                  <option value="active">🟢 Actif</option>
                  <option value="inactive">🟡 Inactif</option>
                  <option value="archived">🔴 Archivé</option>
                </select>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Adresse</label>
                <textarea
                  name="address"
                  rows={1}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={1}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 text-sm rounded-md border border-gray-200 bg-gray-50 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row-reverse gap-2 pt-2 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-700"
            >
              {loading ? "Enregistrement..." : client ? "Mettre à jour" : "Créer le client"}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-lg border-2 border-gray-300"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
