"use client"

import { useState, useEffect } from "react"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  DocumentIcon,
  DocumentTextIcon,
  PhotoIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline"
import { documentsAPI, clientsAPI, projectsAPI } from "../services/api.jsx"
import DocumentUploadModal from "../components/Documents/DocumentUploadModal.jsx"
import DeleteConfirmModal from "../components/Common/DeleteConfirmModal.jsx"
import Select from "react-select"

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [clients, setClients] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [clientFilter, setClientFilter] = useState("")
  const [projectFilter, setProjectFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ show: false, document: null })

  useEffect(() => {
    fetchDocuments()
    fetchClients()
    fetchProjects()
  }, [currentPage, searchTerm, typeFilter, clientFilter, projectFilter])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        type: typeFilter,
        clientId: clientFilter,
        projectId: projectFilter,
      }
      const response = await documentsAPI.getAll(params)
      setDocuments(response.data.documents)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Échec de la récupération des documents:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll({ limit: 100 })
      setClients(response.data.clients)
    } catch (error) {
      console.error("Échec de la récupération des clients:", error)
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

  const handleUploadDocument = () => {
    setShowUploadModal(true)
  }

  const handleDeleteDocument = (document) => {
    setDeleteModal({ show: true, document })
  }

  const confirmDelete = async () => {
    try {
      await documentsAPI.delete(deleteModal.document.id)
      setDeleteModal({ show: false, document: null })
      fetchDocuments()
    } catch (error) {
      console.error("Échec de la suppression du document:", error)
    }
  }

  const handleModalClose = (shouldRefresh) => {
    setShowUploadModal(false)
    if (shouldRefresh) {
      fetchDocuments()
    }
  }

  const handleDownload = async (document) => {
    try {
      const response = await documentsAPI.download(document.id)
      window.open(response.data.downloadUrl, "_blank")
    } catch (error) {
      console.error("Échec du téléchargement du document:", error)
    }
  }

  const getDocumentIcon = (type) => {
    switch (type) {
      case "cin":
      case "title_deed":
      case "permit":
        return <DocumentIcon className="h-8 w-8 text-blue-500" />
      case "contract":
      case "invoice":
      case "receipt":
        return <DocumentTextIcon className="h-8 w-8 text-green-500" />
      case "plan":
      case "cadastral_map":
        return <DocumentChartBarIcon className="h-8 w-8 text-orange-500" />
      case "3d_rendering":
        return <PhotoIcon className="h-8 w-8 text-purple-500" />
      default:
        return <DocumentIcon className="h-8 w-8 text-gray-500" />
    }
  }

  const documentTypes = [
    { value: "cin", label: "CIN" },
    { value: "title_deed", label: "Titre de propriété" },
    { value: "cadastral_map", label: "Plan cadastral" },
    { value: "contract", label: "Contrat" },
    { value: "plan", label: "Plan" },
    { value: "3d_rendering", label: "Rendu 3D" },
    { value: "receipt", label: "Reçu" },
    { value: "invoice", label: "Facture" },
    { value: "permit", label: "Permis" },
    { value: "other", label: "Autre" },
  ]

  if (loading && documents.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les documents de vos projets et clients</p>
        </div>
        <button
          onClick={handleUploadDocument}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Téléverser un document
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-2 top-2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-full w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            {documentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <Select
            options={[
              { value: '', label: 'Tous les clients' },
              ...clients.map(client => ({
                value: client.id,
                label: `${client.firstName} ${client.lastName}`
              }))
            ]}
            value={clients.find(c => c.id === clientFilter) 
              ? { 
                  value: clientFilter, 
                  label: `${clients.find(c => c.id === clientFilter).firstName} ${clients.find(c => c.id === clientFilter).lastName}`
                }
              : { value: '', label: 'Tous les clients' }
            }
            onChange={(selectedOption) => setClientFilter(selectedOption.value)}
            isClearable={false}
            className="react-select-container"
            classNamePrefix="react-select"
          />
          <Select
            options={[
              { value: '', label: 'Tous les projets' },
              ...projects.map(project => ({
                value: project.id,
                label: project.title
              }))
            ]}
            value={projects.find(p => p.id === projectFilter)
              ? {
                  value: projectFilter,
                  label: projects.find(p => p.id === projectFilter).title
                }
              : { value: '', label: 'Tous les projets' }
            }
            onChange={(selectedOption) => setProjectFilter(selectedOption.value)}
            isClearable={false}
            className="react-select-container"
            classNamePrefix="react-select"
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {documents.length === 0 ? (
          <div className="p-6 text-center">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document trouvé</h3>
            <p className="mt-1 text-sm text-gray-500">Commencez par téléverser un nouveau document.</p>
            <div className="mt-6">
              <button
                onClick={handleUploadDocument}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Téléverser un document
              </button>
            </div>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Associé à
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prix
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Téléversé le
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {documents.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">{getDocumentIcon(document.type)}</div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{document.name}</div>
                          <div className="text-xs text-gray-500">{(document.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        {document.client && (
                          <div className="text-gray-900">
                            Client: {document.client.firstName} {document.client.lastName}
                          </div>
                        )}
                        {document.project && <div className="text-gray-900">Projet: {document.project.title}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {document.type === 'title_deed' && 'Titre de propriété'}
                        {document.type === 'cadastral_map' && 'Plan cadastral'}
                        {document.type === 'contract' && 'Contrat'}
                        {document.type === '3d_rendering' && 'Rendu 3D'}
                        {document.type === 'invoice' && 'Facture'}
                        {document.type === 'receipt' && 'Reçu'}
                        {document.type === 'permit' && 'Permis'}
                        {document.type === 'cin' && 'CIN'}
                        {document.type === 'plan' && 'Plan'}
                        {document.type === 'other' && 'Autre'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {document.price > 0 ? `${document.price.toLocaleString()} MAD` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(document.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(document)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Télécharger"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document)}
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
      {showUploadModal && (
        <DocumentUploadModal
          clients={clients}
          projects={projects}
          documentTypes={documentTypes}
          onClose={handleModalClose}
        />
      )}

      {deleteModal.show && (
        <DeleteConfirmModal
          title="Supprimer le document"
          message={`Êtes-vous sûr de vouloir supprimer "${deleteModal.document?.name}" ? Cette action est irréversible.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ show: false, document: null })}
        />
      )}
    </div>
  )
}