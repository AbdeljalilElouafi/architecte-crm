"use client"

import { useEffect } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"

export default function Modal({ title, children, onClose, size = "md" }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [onClose])

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}
