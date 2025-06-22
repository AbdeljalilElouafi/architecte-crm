"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  HomeIcon,
  UsersIcon,
  FolderIcon,
  DocumentIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline"
import { useAuth } from "../../hooks/useAuth.jsx"

const navigation = [
  { name: "Tableau de bord", href: "/", icon: HomeIcon },
  { name: "Clients", href: "/clients", icon: UsersIcon },
  { name: "Projets", href: "/projects", icon: FolderIcon },
  { name: "Documents", href: "/documents", icon: DocumentIcon },
  { name: "Paiements", href: "/payments", icon: CreditCardIcon },
  { name: "Paramétres", href: "/settings", icon: Cog6ToothIcon },
]

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Architect CRM</h1>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <SidebarContent navigation={navigation} isActive={isActive} user={user} logout={logout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900"> CRM Architect </h1>
          </div>
          <SidebarContent navigation={navigation} isActive={isActive} user={user} logout={logout} />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-40 rounded-md bg-white p-2 text-gray-400 shadow-sm hover:text-gray-600"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
    </>
  )
}

function SidebarContent({ navigation, isActive, user, logout }) {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
              isActive(item.href) ? "bg-blue-100 text-blue-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <item.icon
              className={`mr-3 h-6 w-6 flex-shrink-0 ${
                isActive(item.href) ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
              }`}
            />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* User info and logout */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-3 flex w-full items-center px-2 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
        >
          <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400" />
          Déconnexion
        </button>
      </div>
    </div>
  )
}
