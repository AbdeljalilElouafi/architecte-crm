"use client"

import { useState, useEffect } from "react"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"
import { paymentsAPI, projectsAPI } from "../services/api.jsx"
import PaymentModal from "../components/Payments/PaymentModal"
import DeleteConfirmModal from "../components/Common/DeleteConfirmModal"
import Select from "react-select"

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [methodFilter, setMethodFilter] = useState("")
  const [projectFilter, setProjectFilter] = useState("")
  const [dateFilter, setDateFilter] = useState({ startDate: "", endDate: "" })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, payment: null })
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchPayments()
    fetchProjects()
    fetchPaymentStats()
  }, [currentPage, searchTerm, statusFilter, methodFilter, projectFilter, dateFilter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        status: statusFilter,
        method: methodFilter,
        projectId: projectFilter,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
      }
      const response = await paymentsAPI.getAll(params)
      setPayments(response.data.payments)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Échec de la récupération des paiements:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll({ limit: 100 })
      setProjects(response.data.projects)
    } catch (error) {
      console.error("Échec de la récupération des projets:", error)
    }
  }

  const fetchPaymentStats = async () => {
    try {
      const params = {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        projectId: projectFilter,
      }
      const response = await paymentsAPI.getStats(params)
      setStats(response.data)
    } catch (error) {
      console.error("Échec de la récupération des statistiques de paiement:", error)
    }
  }

  const handleCreatePayment = () => {
    setEditingPayment(null)
    setShowModal(true)
  }

  const handleEditPayment = (payment) => {
    setEditingPayment(payment)
    setShowModal(true)
  }

  const handleDeletePayment = (payment) => {
    setDeleteModal({ show: true, payment })
  }

  const confirmDelete = async () => {
    try {
      await paymentsAPI.delete(deleteModal.payment.id)
      setDeleteModal({ show: false, payment: null })
      fetchPayments()
      fetchPaymentStats()
    } catch (error) {
      console.error("Échec de la suppression du paiement:", error)
    }
  }

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false)
    setEditingPayment(null)
    if (shouldRefresh) {
      fetchPayments()
      fetchPaymentStats()
    }
  }

  const handleDateFilterChange = (e) => {
    const { name, value } = e.target
    setDateFilter((prev) => ({ ...prev, [name]: value }))
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case "pending":
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      case "failed":
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getMethodBadge = (method) => {
    const colors = {
      cash: "bg-green-100 text-green-800",
      check: "bg-blue-100 text-blue-800",
      bank_transfer: "bg-purple-100 text-purple-800",
      card: "bg-indigo-100 text-indigo-800",
    }
    return colors[method] || colors.cash
  }

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
          <p className="mt-1 text-sm text-gray-500">Suivez et gérez les paiements des projets</p>
        </div>
        <button
          onClick={handleCreatePayment}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Ajouter un paiement
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total des paiements</p>
                <p className="text-lg font-semibold text-gray-900">{stats.total.count}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Montant total</p>
                <p className="text-lg font-semibold text-gray-900">{stats.total.totalAmount.toLocaleString()} MAD</p>
              </div>
            </div>
          </div>
          {stats.byMethod.cash && (
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Paiements en espèces</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.byMethod.cash.totalAmount.toLocaleString()} MAD
                  </p>
                </div>
              </div>
            </div>
          )}
          {stats.byMethod.bank_transfer && (
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Virements bancaires</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {stats.byMethod.bank_transfer.totalAmount.toLocaleString()} MAD
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-2 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des paiements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-full w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Toutes les méthodes</option>
            <option value="cash">Espèces</option>
            <option value="check">Chèque</option>
            <option value="bank_transfer">Virement bancaire</option>
            <option value="card">Carte</option>
          </select>
          <Select
            options={[
              { value: "", label: "Tous les projets" },
              ...projects.map((project) => ({
                value: project.id,
                label: project.title,
              })),
            ]}
            value={
              projectFilter
                ? {
                    value: projectFilter,
                    label: projects.find((p) => p.id === projectFilter)?.title || "Tous les projets",
                  }
                : { value: "", label: "Tous les projets" }
            }
            onChange={(selectedOption) => setProjectFilter(selectedOption?.value || "")}
            isClearable={false}
            className="basic-select"
            classNamePrefix="select"
            styles={{
              control: (provided) => ({
                ...provided,
                borderRadius: "0.375rem",
                borderColor: "#d1d5db",
                boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                "&:hover": {
                  borderColor: "#d1d5db",
                },
                "&:focus-within": {
                  borderColor: "#3b82f6",
                  boxShadow: "0 0 0 1px #3b82f6",
                },
                minHeight: "38px",
                width: "100%",
              }),
            }}
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {payments.length === 0 ? (
          <div className="p-6 text-center">
            <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun paiement trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un nouveau paiement.</p>
            <div className="mt-6">
              <button
                onClick={handleCreatePayment}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter un paiement
              </button>
            </div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{payment.project?.title}</div>
                        <div className="text-xs text-gray-500">
                          {payment.project?.client?.firstName} {payment.project?.client?.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{payment.amount.toLocaleString()} MAD</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMethodBadge(
                          payment.method,
                        )}`}
                      >
                        {payment.method === 'cash' && 'Espèces'}
                        {payment.method === 'check' && 'Chèque'}
                        {payment.method === 'bank_transfer' && 'Virement bancaire'}
                        {payment.method === 'card' && 'Carte'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(payment.paymentDate).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(payment.status)}
                        <span className="ml-1 text-sm text-gray-500">
                          {payment.status === 'completed' && 'Terminé'}
                          {payment.status === 'pending' && 'En attente'}
                          {payment.status === 'failed' && 'Échoué'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPayment(payment)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePayment(payment)}
                          className="text-red-600 hover:text-red-900"
                          title="Supprimer"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> sur{" "}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {showModal && <PaymentModal payment={editingPayment} projects={projects} onClose={handleModalClose} />}
      {deleteModal.show && (
        <DeleteConfirmModal
          title="Supprimer le Paiement"
          message={`Êtes-vous sûr de vouloir supprimer ce paiement de ${deleteModal.payment?.amount.toLocaleString()} MAD ? Cette action est irréversible.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ show: false, payment: null })}
        />
      )}
    </div>
  )
}