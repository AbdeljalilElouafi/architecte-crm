"use client"

import { useState, useEffect } from "react"
import { paymentsAPI } from "../../services/api.jsx"
import Modal from "../Common/Modal"

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
    if (!formData.projectId) newErrors.projectId = "Project is required"
    if (!formData.amount) newErrors.amount = "Amount is required"
    if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number"
    }
    if (!formData.method) newErrors.method = "Payment method is required"
    if (!formData.paymentDate) newErrors.paymentDate = "Payment date is required"

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
      console.error("Failed to save payment:", error)
      setErrors({ submit: error.response?.data?.message || "Failed to save payment" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title={payment ? "Edit Payment" : "Add New Payment"} onClose={() => onClose(false)}>
      <form onSubmit={handleSubmit}>
        {errors.submit && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{errors.submit}</div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project *</label>
            <select
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.projectId ? "border-red-300" : ""
              }`}
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title} - {project.client?.firstName} {project.client?.lastName}
                </option>
              ))}
            </select>
            {errors.projectId && <p className="mt-1 text-sm text-red-600">{errors.projectId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (MAD) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                errors.amount ? "border-red-300" : ""
              }`}
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.method ? "border-red-300" : ""
                }`}
              >
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
              {errors.method && <p className="mt-1 text-sm text-red-600">{errors.method}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Date *</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.paymentDate ? "border-red-300" : ""
                }`}
              />
              {errors.paymentDate && <p className="mt-1 text-sm text-red-600">{errors.paymentDate}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Reference</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="Check number, transaction ID, etc."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Additional information about this payment..."
            />
          </div>
        </div>

        <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : payment ? "Update" : "Create"}
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
