"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
} from "@heroicons/react/24/outline"
import { projectsAPI, paymentsAPI } from "../services/api.jsx"
import PaymentModal from "../components/Payments/PaymentModal"
import DeleteConfirmModal from "../components/Common/DeleteConfirmModal"

export default function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ show: false, payment: null })
  const [error, setError] = useState("")

  useEffect(() => {
    if (id) {
      fetchProject()
      fetchPayments()
    }
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await projectsAPI.getById(id)
      setProject(response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération du projet:", error)
      setError("Impossible de charger le projet")
    }
  }

  const fetchPayments = async () => {
    try {
      // Check if the API function exists
      if (typeof paymentsAPI.getByProject !== "function") {
        console.error("paymentsAPI.getByProject is not defined. Please check your API service.")
        setPayments([])
        return
      }

      const response = await paymentsAPI.getByProject(id)
      setPayments(response.data.payments || [])
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements:", error)
      setPayments([]) // Set empty array as fallback
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentAdded = () => {
    setShowPaymentModal(false)
    fetchProject() // Refresh project to update financial summary
    fetchPayments() // Refresh payments list
  }

  const handleDeletePayment = (payment) => {
    setDeleteModal({ show: true, payment })
  }

  const confirmDeletePayment = async () => {
    try {
      await paymentsAPI.delete(deleteModal.payment.id)
      setDeleteModal({ show: false, payment: null })
      fetchProject()
      fetchPayments()
    } catch (error) {
      console.error("Erreur lors de la suppression du paiement:", error)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      planning: "bg-gray-100 text-gray-800 border-gray-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      review: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      on_hold: "bg-red-100 text-red-800 border-red-200",
    }
    return colors[status] || colors.planning
  }

  const getStatusLabel = (status) => {
    const labels = {
      planning: "Planification",
      in_progress: "En Cours",
      review: "Révision",
      completed: "Terminé",
      on_hold: "En Attente",
    }
    return labels[status] || status
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
    }
    return colors[priority] || colors.medium
  }

  const getPriorityLabel = (priority) => {
    const labels = {
      low: "Faible",
      medium: "Moyenne",
      high: "Élevée",
      urgent: "Urgent",
    }
    return labels[priority] || priority
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Projet non trouvé</h3>
        <p className="mt-1 text-sm text-gray-500">{error || "Le projet demandé n'existe pas."}</p>
        <div className="mt-6">
          <Link
            to="/projects"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Retour aux projets
          </Link>
        </div>
      </div>
    )
  }

  // Calculate financial data from actual payments and project data
  const totalPaid = payments.reduce((sum, payment) => sum + (Number.parseFloat(payment.amount) || 0), 0)

  // Try to get total price from multiple sources
  const totalPrice = project.financialSummary?.totalPrice || project.totalPrice || project.budget || project.price || 0

  const remainingAmount = Math.max(0, totalPrice - totalPaid)
  const paymentProgress = totalPrice > 0 ? Math.min(100, (totalPaid / totalPrice) * 100) : 0

  // Debug logging (remove in production)
  console.log("Financial Debug:", {
    totalPaid,
    totalPrice,
    financialSummary: project.financialSummary,
    project: project,
    paymentProgress,
    paymentsCount: payments.length,
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/projects" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Retour aux projets
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={`/projects/${project.id}/edit`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Modifier
              </Link>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Ajouter un paiement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
              <p className="mt-2 text-gray-600">{project.description}</p>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}
                >
                  {getStatusLabel(project.status)}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(project.priority)}`}
                >
                  Priorité: {getPriorityLabel(project.priority)}
                </span>
                {project.type && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {project.type.replace("_", " ")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Project Details Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Client</p>
                <p className="text-sm text-gray-600">
                  {project.client?.firstName} {project.client?.lastName}
                </p>
              </div>
            </div>

            {project.startDate && (
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date de début</p>
                  <p className="text-sm text-gray-600">{new Date(project.startDate).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            )}

            {project.endDate && (
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Date de fin</p>
                  <p className="text-sm text-gray-600">{new Date(project.endDate).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Créé le</p>
                <p className="text-sm text-gray-600">{new Date(project.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Aperçu financier</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-900">Prix Total</p>
                  <p className="text-2xl font-bold text-blue-900">{totalPrice.toLocaleString()} MAD</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-900">Montant Payé</p>
                  <p className="text-2xl font-bold text-green-900">{totalPaid.toLocaleString()} MAD</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-900">Montant Restant</p>
                  <p className="text-2xl font-bold text-orange-900">{remainingAmount.toLocaleString()} MAD</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {totalPrice > 0 ? (
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progression des paiements</span>
                <span>{Math.round(paymentProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300 ease-in-out"
                  style={{
                    width: `${paymentProgress}%`,
                    minWidth: paymentProgress > 0 ? "2px" : "0px",
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{totalPaid.toLocaleString()} MAD payé</span>
                <span>{remainingAmount.toLocaleString()} MAD restant</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">Définissez un prix total pour voir la progression des paiements</p>
            </div>
          )}
        </div>
      </div>

      {/* Payments Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Historique des paiements</h2>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau paiement
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-12">
              <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun paiement</h3>
              <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un paiement pour ce projet.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ajouter le Premier paiement
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Méthode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.paymentDate).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-green-600">
                          {payment.amount.toLocaleString()} MAD
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.paymentMethod}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.reference || "-"}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{payment.notes || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
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
            </div>
          )}
        </div>
      </div>

      {/* Project Documents/Files Section */}
      {project.documents && project.documents.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Documents du Projet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.documents.map((doc, index) => (
                <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <DocumentTextIcon className="h-8 w-8 text-gray-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.size}</p>
                  </div>
                  <button className="ml-2 text-blue-600 hover:text-blue-800">
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          projectId={project.id}
          onClose={() => setShowPaymentModal(false)}
          onPaymentAdded={handlePaymentAdded}
        />
      )}

      {deleteModal.show && (
        <DeleteConfirmModal
          title="Supprimer le paiement"
          message={`Êtes-vous sûr de vouloir supprimer ce paiement de ${deleteModal.payment?.amount?.toLocaleString()} MAD ? Cette action ne peut pas être annulée.`}
          onConfirm={confirmDeletePayment}
          onCancel={() => setDeleteModal({ show: false, payment: null })}
        />
      )}
    </div>
  )
}
