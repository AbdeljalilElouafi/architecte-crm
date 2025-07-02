"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { UsersIcon, FolderIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline"
import { dashboardAPI } from "../services/api.jsx"
import RevenueChart from "../components/RevenueChart.jsx"

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error("Échec de la récupération des statistiques du tableau de bord:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const overviewCards = [
    {
      name: "Clients totaux",
      value: stats?.overview?.totalClients || 0,
      icon: UsersIcon,
      color: "bg-blue-500",
      href: "/clients",
    },
    {
      name: "Projets actifs",
      value: stats?.overview?.activeProjects || 0,
      icon: FolderIcon,
      color: "bg-green-500",
      href: "/projects",
    },
    {
      name: "Revenu total",
      value: `${(stats?.overview?.totalRevenue || 0).toLocaleString()} MAD`,
      icon: CurrencyDollarIcon,
      color: "bg-yellow-500",
      href: "/payments",
    },
    {
      name: "Revenu mensuel",
      value: `${(stats?.overview?.monthlyRevenue || 0).toLocaleString()} MAD`,
      icon: CurrencyDollarIcon,
      color: "bg-purple-500",
      href: "/payments",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">Bienvenue ! Voici ce qui se passe avec vos projets.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => (
          <Link
            key={card.name}
            to={card.href}
            className="relative bg-white pt-5 px-4  sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <dt>
              <div className={`absolute ${card.color} rounded-md p-3`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{card.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
            </dd>
          </Link>
        ))}
      </div>

      {/* Revenue Chart - NEW SECTION */}
      <RevenueChart stats={stats} />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Projets récents</h3>
            <div className="space-y-3">
              {stats?.recentActivity?.projects?.slice(0, 5).map((project) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div>
                    <Link
                      to={`/projects/${project.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      {project.title}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {project.client?.firstName} {project.client?.lastName}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      project.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : project.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {project.status === "completed" && "Terminé"}
                    {project.status === "in_progress" && "En cours"}
                    {project.status === "planning" && "Planification"}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/projects" className="text-sm text-blue-600 hover:text-blue-500">
                Voir tous les projets →
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Paiements récents</h3>
            <div className="space-y-3">
              {stats?.recentActivity?.payments?.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{payment.project?.title}</p>
                    <p className="text-xs text-gray-500">
                      {payment.project?.client?.firstName} {payment.project?.client?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">+{payment.amount.toLocaleString()} MAD</p>
                    <p className="text-xs text-gray-500">{new Date(payment.paymentDate).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/payments" className="text-sm text-blue-600 hover:text-blue-500">
                Voir tous les paiements →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
