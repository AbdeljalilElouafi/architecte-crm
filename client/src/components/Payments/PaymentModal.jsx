"use client"

import { useState, useEffect } from "react"
import { paymentsAPI, projectsAPI, clientsAPI } from "../../services/api.jsx"
import Modal from "../Common/Modal"
import Select from "react-select"

export default function PaymentModal({ payment, projects, projectId, onClose }) {
  const [formData, setFormData] = useState({
    clientId: "",
    projectId: projectId || "",
    amount: "",
    paymentMethod: "cash",
    reference: "",
    notes: "",
    paymentDate: new Date().toISOString().split("T")[0],
    status: "completed",
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [availableProjects, setAvailableProjects] = useState(projects || [])
  const [availableClients, setAvailableClients] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])

  // Fetch clients and projects on component mount
  useEffect(() => {
    fetchClients()
    if (!projects && !projectId) {
      fetchProjects()
    }
  }, [projects, projectId])

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll({ limit: 100 })
      setAvailableClients(response.data.clients || [])
    } catch (error) {
      console.error("Error fetching clients:", error)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll({ limit: 100 })
      setAvailableProjects(response.data.projects || [])
      setFilteredProjects(response.data.projects || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    }
  }

  // Filter projects when client changes
  useEffect(() => {
    if (formData.clientId) {
      const clientProjects = availableProjects.filter((project) => project.clientId === formData.clientId)
      setFilteredProjects(clientProjects)

      // Reset project selection if current project doesn't belong to selected client
      if (formData.projectId) {
        const currentProject = availableProjects.find((p) => p.id === formData.projectId)
        if (currentProject && currentProject.clientId !== formData.clientId) {
          setFormData((prev) => ({ ...prev, projectId: "" }))
        }
      }
    } else {
      setFilteredProjects(availableProjects)
    }
  }, [formData.clientId, availableProjects])

  useEffect(() => {
    if (payment) {
      // Find the client for this payment's project
      const project = availableProjects.find((p) => p.id === payment.projectId)
      const clientId = project?.clientId || ""

      setFormData({
        clientId,
        projectId: payment.projectId || projectId || "",
        amount: payment.amount || "",
        paymentMethod: payment.paymentMethod || "cash",
        reference: payment.reference || "",
        notes: payment.notes || "",
        paymentDate: payment.paymentDate
          ? new Date(payment.paymentDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: payment.status || "completed",
      })
    } else if (projectId) {
      // Pre-select project and client if projectId is provided
      const project = availableProjects.find((p) => p.id === projectId)
      const clientId = project?.clientId || ""
      setFormData((prev) => ({ ...prev, projectId, clientId }))
    }
  }, [payment, projectId, availableProjects])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleClientChange = (selectedOption) => {
    const clientId = selectedOption ? selectedOption.value : ""
    setFormData((prev) => ({
      ...prev,
      clientId,
      projectId: "", // Reset project when client changes
    }))
    if (errors.clientId) {
      setErrors((prev) => ({ ...prev, clientId: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!projectId && !formData.clientId) newErrors.clientId = "Un client est requis"
    if (!formData.projectId) newErrors.projectId = "Un projet est requis"
    if (!formData.amount) newErrors.amount = "Le montant est requis"
    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Le montant doit être un nombre positif"
    }
    if (!formData.paymentMethod) newErrors.paymentMethod = "La méthode de paiement est requise"
    if (!formData.paymentDate) newErrors.paymentDate = "La date de paiement est requise"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    try {
      const submitData = {
        projectId: formData.projectId,
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod,
        reference: formData.reference,
        notes: formData.notes,
        paymentDate: formData.paymentDate,
        status: formData.status,
      }

      if (payment) {
        await paymentsAPI.update(payment.id, submitData)
      } else {
        await paymentsAPI.create(submitData)
      }

      onClose(true)
    } catch (error) {
      console.error("Échec de l'enregistrement du paiement:", error)
      const errorMessage =
        error.response?.data?.message || error.response?.data?.error || "Échec de l'enregistrement du paiement"
      setErrors({ submit: errorMessage })
    } finally {
      setLoading(false)
    }
  }

  const getClientOptions = () => {
    return availableClients.map((client) => ({
      value: client.id,
      label: client.clientType === "individual" ? `${client.firstName} ${client.lastName}` : client.companyName,
    }))
  }

  const getProjectOptions = () => {
    return filteredProjects.map((project) => ({
      value: project.id,
      label: project.title,
    }))
  }

  const getSelectedClient = () => {
    const client = availableClients.find((c) => c.id === formData.clientId)
    if (client) {
      return {
        value: client.id,
        label: client.clientType === "individual" ? `${client.firstName} ${client.lastName}` : client.companyName,
      }
    }
    return null
  }

  const getSelectedProject = () => {
    const project = filteredProjects.find((p) => p.id === formData.projectId)
    if (project) {
      return {
        value: project.id,
        label: project.title,
      }
    }
    return null
  }

  return (
    <Modal
      title={payment ? "Modifier le paiement" : "Ajouter un nouveau paiement"}
      onClose={() => onClose(false)}
      size="lg"
    >
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div className="bg-red-100 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r text-sm">
              {errors.submit}
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-blue-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-800">Informations de paiement</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Client Selection - Only show if not pre-selected project */}
              {!projectId && (
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                  <Select
                    options={getClientOptions()}
                    value={getSelectedClient()}
                    onChange={handleClientChange}
                    isClearable
                    placeholder="Sélectionner un client..."
                    classNamePrefix="select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor: errors.clientId ? "#fca5a5" : "#d1d5db",
                        backgroundColor: errors.clientId ? "#fef2f2" : "#f9fafb",
                        minHeight: "36px",
                        borderRadius: "6px",
                        borderWidth: "1px",
                        fontSize: "14px",
                        boxShadow: "none",
                        "&:focus-within": {
                          borderColor: errors.clientId ? "#ef4444" : "#3b82f6",
                          backgroundColor: "#fff",
                        },
                      }),
                    }}
                  />
                  {errors.clientId && <p className="mt-1 text-xs text-red-600">{errors.clientId}</p>}
                </div>
              )}

              {/* Project Selection */}
              <div className={projectId ? "lg:col-span-1" : "lg:col-span-1"}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Projet *</label>
                {projectId ? (
                  <div className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-100 text-gray-700">
                    {getSelectedProject()?.label || "Projet sélectionné"}
                  </div>
                ) : (
                  <Select
                    options={getProjectOptions()}
                    value={getSelectedProject()}
                    onChange={(selectedOption) => {
                      setFormData((prev) => ({
                        ...prev,
                        projectId: selectedOption ? selectedOption.value : "",
                      }))
                      if (errors.projectId) {
                        setErrors((prev) => ({ ...prev, projectId: "" }))
                      }
                    }}
                    isClearable
                    placeholder="Sélectionner un projet..."
                    isDisabled={!formData.clientId && !projectId}
                    classNamePrefix="select"
                    styles={{
                      control: (provided, state) => ({
                        ...provided,
                        borderColor: errors.projectId ? "#fca5a5" : "#d1d5db",
                        backgroundColor: errors.projectId ? "#fef2f2" : "#f9fafb",
                        minHeight: "36px",
                        borderRadius: "6px",
                        borderWidth: "1px",
                        fontSize: "14px",
                        boxShadow: "none",
                        "&:focus-within": {
                          borderColor: errors.projectId ? "#ef4444" : "#3b82f6",
                          backgroundColor: "#fff",
                        },
                      }),
                    }}
                  />
                )}
                {errors.projectId && <p className="mt-1 text-xs text-red-600">{errors.projectId}</p>}
              </div>

              {/* Amount */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                    errors.amount
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                  }`}
                />
                {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
              </div>

              {/* Payment Method */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Méthode de paiement *</label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                    errors.paymentMethod
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                  }`}
                >
                  <option value="cash">💵 Espèces</option>
                  <option value="check">📝 Chèque</option>
                  <option value="bank_transfer">🏦 Virement bancaire</option>
                  <option value="card">💳 Carte</option>
                </select>
                {errors.paymentMethod && <p className="mt-1 text-xs text-red-600">{errors.paymentMethod}</p>}
              </div>

              {/* Payment Date */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de paiement *</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm rounded-md border transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                    errors.paymentDate
                      ? "border-red-300 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                  }`}
                />
                {errors.paymentDate && <p className="mt-1 text-xs text-red-600">{errors.paymentDate}</p>}
              </div>

              {/* Status */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                >
                  <option value="completed">✅ Terminé</option>
                  <option value="pending">⏳ En attente</option>
                  <option value="failed">❌ Échoué</option>
                </select>
              </div>

              {/* Reference */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Référence</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="Numéro de chèque, ID de transaction, etc."
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Notes */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white resize-none"
                  placeholder="Informations supplémentaires sur ce paiement..."
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "Enregistrement..." : payment ? "Mettre à jour" : "Créer le paiement"}
            </button>
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-6 py-2 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
