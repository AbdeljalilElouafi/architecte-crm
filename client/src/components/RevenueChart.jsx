"use client"

import { useState, useEffect } from "react"
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { dashboardAPI } from "../services/api.jsx"

const RevenueChart = ({ stats }) => {
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [animationKey, setAnimationKey] = useState(0)
  const [currentYear, setCurrentYear] = useState(2024)

  useEffect(() => {
    fetchMonthlyRevenue(2024) // Default to 2024 since that's where your data is
  }, [])

  const fetchMonthlyRevenue = async (year = 2024) => {
    setLoading(true)
    try {
      const response = await dashboardAPI.getMonthlyRevenue(year)
      const data = response.data

      // Transform data for the chart
      const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]

      const chartData = data.map((item, index) => ({
        month: monthNames[index],
        monthlyRevenue: Number(item.total) || 0,
        cumulativeRevenue: data.slice(0, index + 1).reduce((sum, curr) => sum + (Number(curr.total) || 0), 0),
      }))

      setMonthlyData(chartData)
      setCurrentYear(year)
      setAnimationKey((prev) => prev + 1)
      setError(null)
    } catch (error) {
      console.error("Error fetching monthly revenue:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return `${Number(value).toLocaleString()} MAD`
  }

  const formatCurrencyShort = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`
    }
    return value.toString()
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-xl">
          <p className="font-bold text-gray-900 mb-3 text-center">{`${label} ${currentYear}`}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm font-medium text-gray-700">
                    {entry.name === "monthlyRevenue" ? "Mensuel" : "Cumulé"}
                  </span>
                </div>
                <span className="font-bold text-gray-900">{formatCurrency(entry.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  const CustomLegend = (props) => {
    const { payload } = props
    return (
      <div className="flex justify-center space-x-8 mt-8 mb-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <div className="w-4 h-4 rounded mr-3" style={{ backgroundColor: entry.color }} />
            <span className="text-sm font-semibold text-gray-700">
              {entry.value === "monthlyRevenue" ? "Revenu mensuel" : "Revenu cumulé"}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-80 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    )
  }

  // Check if we have any actual revenue data
  const hasData = monthlyData.some((item) => item.monthlyRevenue > 0)
  const maxRevenue = Math.max(...monthlyData.map((d) => d.monthlyRevenue))
  const totalRevenue = monthlyData.reduce((sum, item) => sum + item.monthlyRevenue, 0)

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyse des revenus</h3>
            <p className="text-gray-600 font-medium">Évolution mensuelle et cumulative • {currentYear}</p>
            {hasData && (
              <div className="flex items-center mt-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                <span className="text-sm font-semibold text-emerald-700">
                  {monthlyData.filter((d) => d.monthlyRevenue > 0).length} mois avec revenus
                </span>
              </div>
            )}
          </div>

          {/* Year Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-semibold text-gray-600">Année:</span>
            <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => fetchMonthlyRevenue(2024)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  currentYear === 2024
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                2024
              </button>
              <button
                onClick={() => fetchMonthlyRevenue(2025)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  currentYear === 2025
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                2025
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-sm font-semibold text-gray-500 mb-2">Total {currentYear}</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-sm font-semibold text-gray-500 mb-2">Meilleur mois</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(maxRevenue)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-sm font-semibold text-gray-500 mb-2">Moyenne mensuelle</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalRevenue / 12)}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart
              key={animationKey}
              data={monthlyData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 13, fill: "#475569", fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 500 }}
                tickFormatter={formatCurrencyShort}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />

              {/* Monthly Revenue Bars - Solid Color */}
              <Bar
                dataKey="monthlyRevenue"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
                animationDuration={1200}
                animationBegin={200}
              />

              {/* Cumulative Revenue Line */}
              <Line
                type="monotone"
                dataKey="cumulativeRevenue"
                stroke="#10b981"
                strokeWidth={4}
                dot={{
                  fill: "#10b981",
                  strokeWidth: 3,
                  r: 6,
                  stroke: "#ffffff",
                }}
                activeDot={{
                  r: 9,
                  stroke: "#10b981",
                  strokeWidth: 4,
                  fill: "#ffffff",
                  shadow: true,
                }}
                animationDuration={1500}
                animationBegin={800}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center">
              <div className="w-5 h-5 text-red-500 mr-3">⚠️</div>
              <p className="text-sm font-semibold text-red-700">Erreur lors du chargement: {error}</p>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!hasData && !error && (
          <div className="mt-6 p-8 bg-white border border-gray-200 rounded-xl text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-gray-700 mb-2">Aucune donnée de revenu</h4>
            <p className="text-gray-500 font-medium">
              Aucun paiement trouvé pour {currentYear}. Essayez une autre année ou ajoutez des paiements.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RevenueChart
