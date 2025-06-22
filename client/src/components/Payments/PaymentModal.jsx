"use client"

import { useState, useEffect } from "react"
import { paymentsAPI } from "../../services/api.jsx"
import Modal from "../Common/Modal"
import Select from 'react-select'

export default function PaymentModal({ payment, projects, onClose }) {
  const [formData, setFormData] = useState({
    projectId: "",
    amount: "",
    method: "cash",
    reference: "",
    notes: "",
    paymentDate: new Date().toISOString().split("T")[0],
    status: "completed",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (payment) {
      setFormData({
        projectId: payment.projectId || "",
        amount: payment.amount || "",
        method: payment.method || "cash",
        reference: payment.reference || "",
        notes: payment.notes || "",
        paymentDate: payment.paymentDate
          ? new Date(payment.paymentDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        status: payment.status || "completed",
      })
    }
  }, [payment])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.projectId) newErrors.projectId = "Un projet est requis"
    if (!formData.amount) newErrors.amount = "Le montant est requis"
    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Le montant doit être un nombre positif"
    }
    if (!formData.method) newErrors.method = "La méthode de paiement est requise"
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
        ...formData,
        amount: Number(formData.amount),
      }

      if (payment) {
        await paymentsAPI.update(payment.id, submitData)
      } else {
        await paymentsAPI.create(submitData)
      }
      onClose(true)
    } catch (error) {
      console.error("Échec de l'enregistrement du paiement:", error)
      setErrors({ submit: error.response?.data?.message || "Échec de l'enregistrement du paiement" })
    } finally {
      setLoading(false)
    }
  }

return (
  <Modal title={payment ? "Modifier le paiement" : "Ajouter un nouveau paiement"} onClose={() => onClose(false)}>
    <div className="bg-indigo-200 hover:bg-indigo-500 rounded-lg p-4 border border-blue-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-100 border-l-4 border-red-400 text-red-700 px-3 py-2 rounded-r text-sm">
            {errors.submit}
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-1 h-5 bg-blue-500 rounded-full mr-2"></div>
            <h3 className="text-sm font-semibold text-gray-800">Informations de paiement</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Projet *</label>
              <Select
                options={projects.map(project => ({
                  value: project.id,
                  label: `${project.title} - ${project.client?.firstName || ''} ${project.client?.lastName || ''}`.trim()
                }))}
                value={projects.find(p => p.id === formData.projectId) ? {
                  value: formData.projectId,
                  label: `${projects.find(p => p.id === formData.projectId).title} - 
                        ${projects.find(p => p.id === formData.projectId).client?.firstName || ''} 
                        ${projects.find(p => p.id === formData.projectId).client?.lastName || ''}`.trim()
                } : null}
                onChange={(selectedOption) => {
                  setFormData(prev => ({
                    ...prev,
                    projectId: selectedOption ? selectedOption.value : ''
                  }))
                  if (errors.projectId) {
                    setErrors(prev => ({ ...prev, projectId: '' }))
                  }
                }}
                isClearable
                placeholder="Rechercher des projets..."
                classNamePrefix="select"
                styles={{
                  control: (provided, state) => ({
                    ...provided,
                    borderColor: errors.projectId ? '#fca5a5' : '#d1d5db',
                    backgroundColor: errors.projectId ? '#fef2f2' : '#f9fafb',
                    '&:hover': {
                      borderColor: errors.projectId ? '#fca5a5' : '#d1d5db'
                    },
                    minHeight: '38px',
                    borderRadius: '6px',
                    borderWidth: '2px',
                    boxShadow: 'none',
                    '&:focus-within': {
                      borderColor: errors.projectId ? '#ef4444' : '#3b82f6',
                      backgroundColor: '#fff',
                      boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.2)'
                    }
                  })
                }}
              />
              {errors.projectId && <p className="mt-1 text-xs text-red-600">{errors.projectId}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Montant (MAD) *</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                  errors.amount 
                    ? "border-red-300 bg-red-50 focus:border-red-500" 
                    : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                }`}
              />
              {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Méthode de paiement *</label>
                <select
                  name="method"
                  value={formData.method}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                    errors.method 
                      ? "border-red-300 bg-red-50 focus:border-red-500" 
                      : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                  }`}
                >
                  <option value="cash">Espèces</option>
                  <option value="check">Chèque</option>
                  <option value="bank_transfer">Virement bancaire</option>
                  <option value="card">Carte</option>
                </select>
                {errors.method && <p className="mt-1 text-xs text-red-600">{errors.method}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date de paiement *</label>
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 text-sm rounded-md border-2 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 ${
                    errors.paymentDate 
                      ? "border-red-300 bg-red-50 focus:border-red-500" 
                      : "border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white"
                  }`}
                />
                {errors.paymentDate && <p className="mt-1 text-xs text-red-600">{errors.paymentDate}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Référence</label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Numéro de chèque, ID de transaction, etc."
                className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
              >
                <option value="completed">Terminé</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoué</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border-2 border-gray-200 bg-gray-50 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white resize-none"
                placeholder="Informations supplémentaires sur ce paiement..."
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
            {loading ? "Enregistrement..." : payment ? "Mettre à jour" : "Créer"}
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