"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import { projectsAPI, clientsAPI } from "../services/api.jsx"
import ProjectModal from "../components/Projects/ProjectModal"
import DeleteConfirmModal from "../components/Common/DeleteConfirmModal"

const statusColumns = {
  planning: { title: "Planning", color: "bg-gray-100" },
  in_progress: { title: "In Progress", color: "bg-blue-100" },
  review: { title: "Review", color: "bg-yellow-100" },
  completed: { title: "Completed", color: "bg-green-100" },
  on_hold: { title: "On Hold", color: "bg-red-100" },
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("kanban") // kanban or list
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [clientFilter, setClientFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [deleteModal, setDeleteModal] = useState({ show: false, project: null })

  useEffect(() => {
    fetchProjects()
    fetchClients()
  }, [currentPage, searchTerm, statusFilter, clientFilter])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: viewMode === "kanban" ? 100 : 10,
        search: searchTerm,
        status: statusFilter,
        clientId: clientFilter,
      }
      const response = await projectsAPI.getAll(params)
      setProjects(response.data.projects)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Failed to fetch projects:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll({ limit: 100 })
      setClients(response.data.clients)
    } catch (error) {
      console.error("Failed to fetch clients:", error)
    }
  }

  const handleCreateProject = () => {
    setEditingProject(null)
    setShowModal(true)
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setShowModal(true)
  }

  const handleDeleteProject = (project) => {
    setDeleteModal({ show: true, project })
  }

  const confirmDelete = async () => {
    try {
      await projectsAPI.delete(deleteModal.project.id)
      setDeleteModal({ show: false, project: null })
      fetchProjects()
    } catch (error) {
      console.error("Failed to delete project:", error)
    }
  }

  const handleModalClose = (shouldRefresh) => {
    setShowModal(false)
    setEditingProject(null)
    if (shouldRefresh) {
      fetchProjects()
    }
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return

    const { draggableId, destination } = result
    const projectId = draggableId
    const newStatus = destination.droppableId

    try {
      await projectsAPI.update(projectId, { status: newStatus })
      fetchProjects()
    } catch (error) {
      console.error("Failed to update project status:", error)
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      planning: "bg-gray-100 text-gray-800",
      in_progress: "bg-blue-100 text-blue-800",
      review: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      on_hold: "bg-red-100 text-red-800",
    }
    return colors[status] || colors.planning
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    }
    return colors[priority] || colors.medium
  }

  const filteredProjects = projects.filter((project) => {
    return (
      (!searchTerm ||
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!statusFilter || project.status === statusFilter) &&
      (!clientFilter || project.clientId.toString() === clientFilter)
    )
  })

  const groupedProjects = Object.keys(statusColumns).reduce((acc, status) => {
    acc[status] = filteredProjects.filter((project) => project.status === status)
    return acc
  }, {})

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your architectural projects and track progress</p>
        </div>
        <div className="flex space-x-3">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === "kanban"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
                viewMode === "list"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={handleCreateProject}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Project
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(statusColumns).map(([key, { title }]) => (
              <option key={key} value={key}>
                {title}
              </option>
            ))}
          </select>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All Clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.firstName} {client.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {viewMode === "kanban" ? (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Object.entries(statusColumns).map(([status, { title, color }]) => (
              <div key={status} className="bg-white rounded-lg shadow">
                <div className={`${color} px-4 py-3 rounded-t-lg`}>
                  <h3 className="font-medium text-gray-900">{title}</h3>
                  <p className="text-sm text-gray-600">{groupedProjects[status]?.length || 0} projects</p>
                </div>
                <Droppable droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-4 min-h-[200px] ${snapshot.isDraggingOver ? "bg-gray-50" : ""}`}
                    >
                      {groupedProjects[status]?.map((project, index) => (
                        <Draggable key={project.id} draggableId={project.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition-shadow ${
                                snapshot.isDragging ? "rotate-3 shadow-lg" : ""
                              }`}
                            >
                              <ProjectCard
                                project={project}
                                onEdit={handleEditProject}
                                onDelete={handleDeleteProject}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <ProjectsList
          projects={filteredProjects}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}

      {/* Modals */}
      {showModal && <ProjectModal project={editingProject} clients={clients} onClose={handleModalClose} />}

      {deleteModal.show && (
        <DeleteConfirmModal
          title="Delete Project"
          message={`Are you sure you want to delete "${deleteModal.project?.title}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ show: false, project: null })}
        />
      )}
    </div>
  )
}

function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{project.title}</h4>
        <div className="flex space-x-1">
          <button onClick={() => onEdit(project)} className="text-gray-400 hover:text-blue-600" title="Edit">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(project)} className="text-gray-400 hover:text-red-600" title="Delete">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center text-xs text-gray-500">
        <UserIcon className="h-3 w-3 mr-1" />
        {project.client?.firstName} {project.client?.lastName}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full font-medium ${
            project.priority === "urgent"
              ? "bg-red-100 text-red-800"
              : project.priority === "high"
                ? "bg-orange-100 text-orange-800"
                : project.priority === "medium"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
          }`}
        >
          {project.priority}
        </span>
      </div>

      {project.financialSummary && (
        <div className="text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-medium">{project.financialSummary.totalPrice.toLocaleString()} MAD</span>
          </div>
          <div className="flex justify-between">
            <span>Paid:</span>
            <span className="text-green-600">{project.financialSummary.totalPaid.toLocaleString()} MAD</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
            <div
              className="bg-green-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, project.financialSummary.paymentProgress)}%` }}
            ></div>
          </div>
        </div>
      )}

      {project.startDate && (
        <div className="flex items-center text-xs text-gray-500">
          <CalendarIcon className="h-3 w-3 mr-1" />
          {new Date(project.startDate).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

function ProjectsList({ projects, onEdit, onDelete, currentPage, totalPages, setCurrentPage }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Financial
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">{project.title}</div>
                  <div className="text-sm text-gray-500">{project.type?.replace("_", " ")}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {project.client?.firstName} {project.client?.lastName}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : project.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : project.status === "review"
                          ? "bg-yellow-100 text-yellow-800"
                          : project.status === "on_hold"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {project.status?.replace("_", " ")}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    project.priority === "urgent"
                      ? "bg-red-100 text-red-800"
                      : project.priority === "high"
                        ? "bg-orange-100 text-orange-800"
                        : project.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                  }`}
                >
                  {project.priority}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {project.financialSummary ? (
                  <div className="text-sm">
                    <div className="text-gray-900">{project.financialSummary.totalPrice.toLocaleString()} MAD</div>
                    <div className="text-green-600">{project.financialSummary.totalPaid.toLocaleString()} paid</div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No financial data</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Link to={`/projects/${project.id}`} className="text-blue-600 hover:text-blue-900" title="View">
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => onEdit(project)}
                    className="text-indigo-600 hover:text-indigo-900"
                    title="Edit"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(project)} className="text-red-600 hover:text-red-900" title="Delete">
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
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{" "}
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
    </div>
  )
}
