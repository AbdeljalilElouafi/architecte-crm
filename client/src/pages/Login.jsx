"use client"

import { useState } from "react"
import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth.jsx"

export default function Login() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login, isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await login(credentials)

    if (!result.success) {
      setError(result.error)
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Architectural Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Floating Geometric Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-300/20 transform rotate-45 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-slate-300/20 transform rotate-12 animate-bounce"></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 border border-blue-400/30 transform -rotate-12"></div>
        <div className="absolute bottom-20 right-20 w-28 h-28 border border-slate-400/20 transform rotate-45"></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Main Login Card */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:scale-105 transition-all duration-300">
            
            {/* Header Section with Architectural Icon */}
            <div className="relative bg-gradient-to-r from-blue-600 to-slate-700 px-8 py-12 text-center">
              <div className="absolute inset-0 bg-black/10"></div>
              
              {/* Architectural Logo/Icon */}
              <div className="relative mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
                CRM Architecte
              </h1>
            </div>

            {/* Login Section */}
            <div className="px-8 py-8 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                  Connexion à votre espace
                </h2>
              </div>

              <div className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="rounded-2xl bg-red-50 border border-red-200 p-4 animate-pulse">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <div className="text-sm text-red-700 font-medium">{error}</div>
                    </div>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="relative group">
                    <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                      Adresse e-mail
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                        </svg>
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={credentials.email}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={credentials.password}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-2xl bg-slate-50/50 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-base"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={handleSubmit}
                    className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-slate-700 hover:from-blue-700 hover:to-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-xl hover:shadow-2xl"
                  >
                    {loading && (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {loading ? "Connexion en cours..." : "Se connecter"}
                    {!loading && (
                      <svg className="ml-2 -mr-1 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                      </svg>
                    )}
                  </button>
                </div>

                {/* Demo Credentials */}
                <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-200/50">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 font-medium mb-2">
                      <span className="inline-flex items-center">
                        <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Identifiants de démonstration
                      </span>
                    </p>
                    <p className="text-sm text-blue-700 bg-blue-100/50 rounded-lg px-3 py-2 font-mono">
                      admin@architect.com / admin123
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-blue-100/80 text-sm">
              Conçu pour les professionnels de l'architecture
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}