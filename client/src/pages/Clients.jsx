"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline"
import { clientsAPI } from "../services/api.jsx"
import ClientModal from "../components/Clients/ClientModal"
import DeleteConfirmModal from "../components/Common/DeleteConfirmModal"

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [clientTypeFilter, setClientTypeFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, client: null })

  useEffect(() => {
    fetchClients()
  }, [currentPage, searchTerm, statusFilter, clientTypeFilter])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        clientType: clientTypeFilter,
      }
      const response = await clientsAPI.getAll(params)
      setClients(response.data.clients)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Échec de la récupération des clients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateClient = () => {
    setEditingClient(null)
    setShowModal(true)
  }

  const handleEditClient = (client) => {
    setEditingClient(client)
    setShowModal(true)
  }

  const handleDeleteClient = (client) => {
    setDeleteModal({ show: true, client })
  }

  const confirmDelete = async () => {
    try {
      await clientsAPI.delete(deleteModal.client.id)
      setDeleteModal({ show: false, client: null })
      fetchClients()
    } catch (error) {
      console.error("Échec de la suppression du client:", error)
    }
  }

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false)
    setEditingClient(null)
    if (shouldRefresh) {
      fetchClients()
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      archived: "bg-gray-100 text-gray-800",
    }
    return colors[status] || colors.active
  }

  const getClientTypeBadge = (clientType) => {
    return clientType === "individual" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
  }

  const getClientDisplayName = (client) => {
    if (client.clientType === "individual") {
      return `${client.firstName} ${client.lastName}`
    } else {
      return client.companyName
    }
  }

  const getClientIdentifier = (client) => {
    if (client.clientType === "individual") {
      return `CIN: ${client.cin}`
    } else {
      return `RC: ${client.rc} | ICE: ${client.ice}`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez vos relations et informations clients</p>
        </div>
        <button
          onClick={handleCreateClient}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Ajouter un client
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-2 top-1 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <select
            value={clientTypeFilter}
            onChange={(e) => setClientTypeFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="individual">Personne physique</option>
            <option value="corporate">Personne morale</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projets
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
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              client.clientType === "individual" ? "bg-blue-100" : "bg-purple-100"
                            }`}
                          >
                            {client.clientType === "individual" ? (
                              <UserIcon className="h-5 w-5 text-blue-600" />
                            ) : (
                              <BuildingOfficeIcon className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{getClientDisplayName(client)}</div>
                          <div className="text-sm text-gray-500">{getClientIdentifier(client)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getClientTypeBadge(client.clientType)}`}
                      >
                        {client.clientType === "individual" ? "Personne physique" : "Personne morale"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.email}</div>
                      <div className="text-sm text-gray-500">{client.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.projects?.length || 0} projets</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(client.status)}`}
                      >
                        {client.status === "active" && "Actif"}
                        {client.status === "inactive" && "Inactif"}
                        {client.status === "archived" && "Archivé"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClient(client)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client)}
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
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
      {showModal && <ClientModal client={editingClient} onClose={handleModalClose} />}
      {deleteModal.show && (
        <DeleteConfirmModal
          title="Supprimer le client"
          message={`Êtes-vous sûr de vouloir supprimer ${getClientDisplayName(deleteModal.client)} ? Cette action est irréversible.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ show: false, client: null })}
        />
      )}
    </div>
  )
}
