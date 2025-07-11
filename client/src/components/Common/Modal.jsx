"use client"
import { useEffect } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"

function Modal({ title, children, onClose, size = "md" }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    // Store original values
    const originalBodyOverflow = document.body.style.overflow
    const originalHtmlOverflow = document.documentElement.style.overflow
    const originalBodyHeight = document.body.style.height
    const originalHtmlHeight = document.documentElement.style.height
    
    // Apply modal styles
    document.body.style.overflow = "hidden"
    document.documentElement.style.overflow = "hidden"
    document.body.style.height = "100%"
    document.documentElement.style.height = "100%"
    
    return () => {
      // Restore original values
      document.body.style.overflow = originalBodyOverflow
      document.documentElement.style.overflow = originalHtmlOverflow
      document.body.style.height = originalBodyHeight
      document.documentElement.style.height = originalHtmlHeight
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
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full mx-4",
  }

  return (
    <div 
      className="bg-gray-500 bg-opacity-75 flex items-center justify-center p-4"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        margin: 0,
        padding: '16px',
        transition: 'none' // Override the global transition
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} transform max-h-[90vh] overflow-hidden`}
        style={{ 
          transition: 'none' // Override the global transition
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            style={{ transition: 'color 0.2s ease-in-out' }}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 max-h-[calc(90vh-8rem)] overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

export default Modal